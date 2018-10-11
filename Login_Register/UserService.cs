using Sabio.Data;
using Sabio.Data.Providers;
using Sabio.Models.Domain;
using Sabio.Models.Requests;
using Sabio.Models.Responses;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;

namespace Sabio.Services
{
    public class UserService 
    {
        readonly IDataProvider dataProvider; //In house abstractio of ADO.NET sqlreader
        SendGridService sendGridService;
        readonly IAuthenticationService authenticationService; //In house abstraction of OWIN

        public UserService(IDataProvider dataProvider, SendGridService sendGridService,IAuthenticationService authenticationService)
        {
            this.dataProvider = dataProvider;
            this.sendGridService = sendGridService;
            this.authenticationService = authenticationService;
        }

        public void SetLoginCookie(string email)
        {
            int UserId = 0;
            string FirstName = "";
            UserBase userInfo = new UserBase();
            List<string> Roles = new List<string>();
            

            dataProvider.ExecuteNonQuery(
                "User_SetLoginCookie",
                (parameters) =>
                {
                    parameters.AddWithValue("@Email", email);
                    parameters.Add("@Id", SqlDbType.Int).Direction = ParameterDirection.Output;
                    parameters.Add("@FirstName", SqlDbType.NVarChar, 50).Direction = ParameterDirection.Output;
                },
                (parameters) =>
                {
                    UserId = (int)parameters["@Id"].Value;
                    FirstName = (string)parameters["@FirstName"].Value;
                });

            dataProvider.ExecuteCmd(
                "User_GetRoles",
                (parameters) =>
                {
                    parameters.AddWithValue("@Id", UserId);
                },
                (reader, resultsIndex) =>
                {
                    Roles.Add((string)reader["Role"]);
                }
                );

            authenticationService.LogIn(new UserBase()
            {
                Id = UserId,
                Name = FirstName,
                Roles = Roles
            });
        }

        public PagedItemResponse<UserSearch> Search(int pageIndex, int pageSize, string query)
        {
            PagedItemResponse<UserSearch> pagedItemResponse = new PagedItemResponse<UserSearch>();

            List<UserSearch> userList = new List<UserSearch>();

            dataProvider.ExecuteCmd(
                "User_GetBySearch",
                (parameters) =>
                {
                    parameters.AddWithValue("@PageIndex", pageIndex);
                    parameters.AddWithValue("@PageSize", pageSize);
                    parameters.AddWithValue("@Search", query);
                    
                },
                (reader, resultSetIndex) =>
                {
                    UserSearch userSearch = new UserSearch
                    {
                        Id = (int)reader["Id"],
                        Name = (string)reader["Name"],
                        
                    };

                    User user = MapUser(reader);
                    pagedItemResponse.TotalCount = (int)reader["TotalCount"];
                    userList.Add(userSearch);

                });
            pagedItemResponse.PagedItems = userList;
            return pagedItemResponse;
        }

        public void Delete(int id)
        {
            dataProvider.ExecuteNonQuery(
                "User_Delete",
                (parameters) =>
                {
                    parameters.AddWithValue("@Id", id);
                });
        }

        public User GetById(int id)
        {
            User user = null;

            dataProvider.ExecuteCmd(
                "User_GetById",
                (parameters) =>
                {
                    parameters.AddWithValue("@Id", id);
                },
                (reader, resultSetIndex) =>
                {
                    user = MapUser(reader);
                });
            return user;
        }

        public bool Login(UserLoginRequest userLoginRequest)
        {
            bool isValid = false;

            dataProvider.ExecuteCmd(
                "User_Login",
                (parameters) =>
                {
                    parameters.AddWithValue("@Email", userLoginRequest.Email);
                },
                (reader, resultSetIndex) =>
                {
                    string passwordHash = (string)reader["PasswordHash"];
                    isValid = BCrypt.Net.BCrypt.Verify(userLoginRequest.Password, passwordHash);
                });

            return isValid;
        }

        public bool CheckConfirmation(string email)
        {
            bool isConfirmed = false;
            dataProvider.ExecuteNonQuery(
                "User_CheckConfirmation",
                (parameters) =>
                {
                    parameters.AddWithValue("@Email", email);
                    parameters.Add("@IsConfirmed", SqlDbType.Bit).Direction = ParameterDirection.Output;
                },
                (parameters) =>
                {
                    isConfirmed = (bool)parameters["@IsConfirmed"].Value;
                });

            return isConfirmed;
        }

        public async Task<int> Create(UserCreateRequest userCreateRequest)
        {
            int newId = 0;

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(userCreateRequest.Password);

            try
            {
                dataProvider.ExecuteNonQuery(
                    "User_Insert",
                    (parameters) =>
                    {
                        parameters.AddWithValue("@FirstName", userCreateRequest.FirstName);
                        parameters.AddWithValue("@LastName", userCreateRequest.LastName);
                        parameters.AddWithValue("@Email", userCreateRequest.Email);
                        parameters.AddWithValue("@PasswordHash", passwordHash);
                        parameters.AddWithValue("@MobilePhone", userCreateRequest.MobilePhone);
                        parameters.Add("@Id", SqlDbType.Int).Direction = ParameterDirection.Output;
                    },
                    (parameters) =>
                    {
                        newId = (int)parameters["@Id"].Value;
                    });
            }
            catch (SqlException e) when (e.Number == 2601)
            {
                throw new DuplicateEmailException("Email already in use");
            }

            Guid token = Guid.NewGuid();

            dataProvider.ExecuteNonQuery(
                "Token_Insert",
                (parameters) =>
                {
                    parameters.AddWithValue("@Guid", token);
                    parameters.AddWithValue("@Email", userCreateRequest.Email);
                    parameters.AddWithValue("@TokenType", 1);
                },
                (parameters) => { });

            await sendGridService.SendMail(userCreateRequest.Email, userCreateRequest.FirstName, token);
            return newId;

        }

        public async Task ResendToken(string email)
        {
            Guid token = Guid.NewGuid();
            string name = "";

            dataProvider.ExecuteNonQuery(
                "SecurityToken_Reset",
                (parameters) =>
                {
                    parameters.AddWithValue("@Guid", token);
                    parameters.AddWithValue("@Email", email);
                    parameters.Add("@FirstName", SqlDbType.NVarChar, 50).Direction = ParameterDirection.Output;
                },
                (parameters) =>
                {
                    name = (string)parameters["@FirstName"].Value;
                }
                );

            await sendGridService.SendMail(email, name, token);
        }

        public UserEmailConfirmation ConfirmEmail(Guid guid)
        {

            UserEmailConfirmation response = new UserEmailConfirmation();

            dataProvider.ExecuteNonQuery(
                "User_ConfirmEmail",
                (parameters) =>
                {
                    parameters.AddWithValue("@Guid", guid);
                    parameters.Add("@Email", SqlDbType.NVarChar, 200).Direction = ParameterDirection.Output;
                    parameters.Add("@IsExpired", SqlDbType.Bit).Direction = ParameterDirection.Output;
                },
                (parameters) =>
                {
                    response.Email = (string)parameters["@Email"].Value;
                    response.IsExpired = (bool)parameters["@IsExpired"].Value;
                }
                );

            return response;
        }

        public void Deactivate(int id)
        {
            dataProvider.ExecuteNonQuery(
                "User_Deactivate",
                (parameters) =>
                {
                    parameters.AddWithValue("@Id", id);
                } );
        }

        public void Update(int id, UserUpdateRequest userUpdateRequest)
        {
            if (id == userUpdateRequest.Id)
            {
                dataProvider.ExecuteNonQuery(
                    "User_Update",
                    (parameters) =>
                    {
                        parameters.AddWithValue("@Id", userUpdateRequest.Id);
                        parameters.AddWithValue("@FirstName", userUpdateRequest.FirstName);
                        parameters.AddWithValue("@LastName", userUpdateRequest.LastName);
                        parameters.AddWithValue("@Email", userUpdateRequest.Email);
                        parameters.AddWithValue("@ProfilePicture", userUpdateRequest.ProfilePicture);
                        parameters.AddWithValue("@MobilePhone", userUpdateRequest.MobilePhone);
                        parameters.AddWithValue("@OfficeId", userUpdateRequest.OfficeId);
                        parameters.AddWithValue("@License", userUpdateRequest.License);
                        parameters.AddWithValue("@AltPhone", userUpdateRequest.AltPhone);
                        parameters.AddWithValue("@IsBroker", userUpdateRequest.IsBroker);

                    },
                    (parameters) => { }
                    );
            }
        }

        public void UpdateContactInfo(int userId,UserUpdateContactRequest request)
        {
            dataProvider.ExecuteNonQuery(
                "User_UpdateContactInfo",
                (parameters) =>
                {
                    parameters.AddWithValue("@UserId", userId);
                    parameters.AddWithValue("@MobilePhone", request.Phone);
                    parameters.AddWithValue("@Email", request.Email);
                });
        }

        public List<string> GetRoles(int id)
        {
            List<string> rolesList = new List<string>();

            dataProvider.ExecuteCmd(
                "User_GetRoles",
                (parameters) =>
                {
                    parameters.AddWithValue("@Id", id);
                },
                (reader, resultsIndex) =>
                {
                    rolesList.Add((string)reader["Role"]);
                }
                );
            return rolesList;
        }

        #region helper methods
        private static User MapUser(IDataReader reader)
        {
            return new User
            {
                Id = (int)reader["Id"],
                FirstName = (string)reader["FirstName"],
                LastName = (string)reader["LastName"],
                Email = (string)reader["Email"],
                PasswordHash = (string)reader["PasswordHash"],
                IsConfirmed = (bool)reader["IsConfirmed"],
                MobilePhone = (string)reader["MobilePhone"],
                IsBroker = (bool)reader["IsBroker"],
                Inactive = (bool)reader["Inactive"],
                DateCreated = (DateTime)reader["DateCreated"],
                DateModified = (DateTime)reader["DateModified"],
                AltPhone = reader.GetSafeString("AltPhone"),
                ProfilePicture = reader.GetSafeString("ProfilePicture"),
                OfficeId = reader.GetSafeInt32Nullable("OfficeId"),
                License = reader.GetSafeString("License"),
                IsGoogly = (bool)reader["IsGoogly"],
                IsMicrosofty = (bool)reader["IsMicrosofty"]
            };
        }
        #endregion
    }

}

using Sabio.Models.Domain;
using Sabio.Models.Requests;
using Sabio.Models.Responses;
using Sabio.Services;
using Sabio.Services.Security;
using Sabio.Web.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace Sabio.Web.Controllers
{
    [RoutePrefix("api/users")]
    public class UserController : ApiController
    {
        readonly UserService userService;
        readonly IAuthenticationService authenticationService;  //In house abstraction of OWIN

        public UserController(UserService userService, IAuthenticationService authenticationService)
        {
            this.userService = userService;
            this.authenticationService = authenticationService;
        }

        [Route, HttpPost, AllowAnonymous]
        public async Task<HttpResponseMessage> Create(UserCreateRequest userCreateRequest)
        {
            int newId;

            if (userCreateRequest == null)
            {
                ModelState.AddModelError(" ", "missing body data");
            }
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            try
            {
                newId = await userService.Create(userCreateRequest);
            }
            catch (DuplicateEmailException)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, new ErrorResponse("Email already in use"));
            }

            return Request.CreateResponse(HttpStatusCode.Created, new ItemResponse<int> { Item = newId });


        }

        [Route("emailConfirm"), HttpGet, AllowAnonymous]
        public HttpResponseMessage ConfirmEmail(Guid guid)
        {
            UserEmailConfirmation response = userService.ConfirmEmail(guid);

            return Request.CreateResponse(HttpStatusCode.OK, new ItemResponse<UserEmailConfirmation> { Item = response });
        }

        [Route("login"), HttpPost, AllowAnonymous]
        public HttpResponseMessage Login(UserLoginRequest userLoginRequest)
        {

            bool isValid = userService.Login(userLoginRequest);
            bool isConfirmed = userService.CheckConfirmation(userLoginRequest.Email);
            LoginCode code;

            if (!isValid)
            {
                code = LoginCode.Failure;
            }
            else
            {
                if (isConfirmed)
                {
                    userService.SetLoginCookie(userLoginRequest.Email);
                    code = LoginCode.Success;
                }
                else
                    code = LoginCode.NeedsConfirmation;
            }

            return Request.CreateResponse(HttpStatusCode.OK, new ItemResponse<LoginCode> { Item = code });
        }

        [Route("resendToken"), HttpPost, AllowAnonymous]
        public async Task<HttpResponseMessage> ResendToken([FromBody]string email)
        {
            await userService.ResendToken(email);

            return Request.CreateResponse(HttpStatusCode.OK, new SuccessResponse());
        }

        [Route("logout"), HttpPost, AllowAnonymous]
        public HttpResponseMessage Logout()
        {
            authenticationService.LogOut();

            return Request.CreateResponse(HttpStatusCode.OK, new SuccessResponse());
        }

        [Route("checkLogin"), HttpPost, AllowAnonymous]
        public HttpResponseMessage CheckLogin()
        {
            CookieResponse cookieResponse = new CookieResponse();

            if (User.Identity.GetId().HasValue)
            {
                cookieResponse.UserId = User.Identity.GetId().Value;
                cookieResponse.Name = User.Identity.Name.ToString();
                cookieResponse.Roles = User.Identity.GetRoles().ToList();

                User userInfo = userService.GetById(User.Identity.GetId().Value);
                cookieResponse.user = userInfo;

                return Request.CreateResponse(HttpStatusCode.OK, new ItemResponse<CookieResponse> { Item = cookieResponse });
            }

            else
            {
                return Request.CreateResponse(HttpStatusCode.OK, new ItemResponse<string> { Item = null });
            }

        }

        [Route("{id:int}"), HttpDelete, Authorize(Roles = "Admin")]
        public HttpResponseMessage Delete(int id)
        {
            userService.Delete(id);

            return Request.CreateResponse(HttpStatusCode.OK, new SuccessResponse());
        }

        [Route("deactivate/{id:int}"), HttpPut, Authorize(Roles = "Admin")]
        public HttpResponseMessage Deactivate(int id)
        {
            userService.Deactivate(id);

            return Request.CreateResponse(HttpStatusCode.OK, new SuccessResponse());
        }

        [Route("search"), HttpGet, Authorize]
        public HttpResponseMessage GetBySearch(int PageIndex, int PageSize, string query)
        {
            PagedItemResponse<UserSearch> pagedItemResponse = userService.Search(PageIndex, PageSize, query);

            return Request.CreateResponse(HttpStatusCode.OK, new ItemResponse<PagedItemResponse<UserSearch>>
            {
                Item = pagedItemResponse
            });
        }

        [Route("{id:int}"), HttpGet, Authorize(Roles = "Agent")]
        public HttpResponseMessage GetById(int id)
        {
            User user = userService.GetById(id);

            return Request.CreateResponse(HttpStatusCode.OK, new ItemResponse<User> { Item = user });
        }

        [Route("{id:int}"), HttpPut, Authorize(Roles = "Agent")]
        public HttpResponseMessage Update(int id, UserUpdateRequest userUpdateRequest)
        {
            if (userUpdateRequest == null)
            {
                ModelState.AddModelError(" ", "missing body data");
            }
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            userService.Update(id, userUpdateRequest);

            return Request.CreateResponse(HttpStatusCode.OK, new SuccessResponse());
        }

        [Route("contact"), HttpPut,Authorize(Roles ="Agent")]
        public HttpResponseMessage UpdateContact(UserUpdateContactRequest request)
        {
            if (request == null)
            {
                ModelState.AddModelError(" ", "missing");
            }
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            int UserId = User.Identity.GetId().Value;
            userService.UpdateContactInfo(UserId, request);
            bool isConfirmed = userService.CheckConfirmation(request.Email);

            if (isConfirmed == false)
            {
               userService.ResendToken(request.Email);
            }

            return Request.CreateResponse(HttpStatusCode.OK, new SuccessResponse());
        }

        [Route("roles/{id:int}"),HttpGet, Authorize(Roles = "Agent")]
        public HttpResponseMessage GetRoles(int id)
        {
            List<string> rolesList = new List<string>();

            rolesList = userService.GetRoles(id);

            return Request.CreateResponse(HttpStatusCode.OK, new ItemResponse<List<string>> { Item = rolesList });
        }

    }
}
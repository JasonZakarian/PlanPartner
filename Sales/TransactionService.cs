using Sabio.Data;
using Sabio.Data.Providers;
using Sabio.Models.Domain;
using Sabio.Models.Requests;
using Sabio.Models.Responses;
using Sabio.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Data;

namespace Sabio.Services
{
    public class TransactionService : ITransactionService
    {
        readonly IDataProvider dataProvider;

        public TransactionService(IDataProvider dataProvider)
        {
            this.dataProvider = dataProvider;
        }

        public ItemsResponse<LeadAutoComplete> LeadSearch(string Search,int UserId)
        {
            ItemsResponse<LeadAutoComplete> itemsResponse = new ItemsResponse<LeadAutoComplete>();
            List<LeadAutoComplete> leadList = new List<LeadAutoComplete>();

            dataProvider.ExecuteCmd(
                "Leads_GetBySearch",
                (parameters) =>
                {
                    parameters.AddWithValue("@Search", Search);
                    parameters.AddWithValue("@UserId", UserId);
                },
                (reader, resultsIndex) =>
                {
                    LeadAutoComplete lead = new LeadAutoComplete();
                    lead.Id = (int)reader["Id"];
                    lead.Name = (string)reader["LeadName"];
                    leadList.Add(lead);
                });

            itemsResponse.Items = leadList;

            return itemsResponse;
        }

        public ItemResponse<PlanMetricResponse> GetPlanPercentages(int UserId)
        {
            ItemResponse<PlanMetricResponse> response = new ItemResponse<PlanMetricResponse>();
            PlanMetricResponse metrics = new PlanMetricResponse();

            dataProvider.ExecuteCmd(
                "Transaction_GetPlanPercentages",
                (parameters) =>
                {
                    parameters.AddWithValue("UserId", UserId);
                },
                (reader, resultsIndex) =>
                {
                    metrics.FranchiseFee = (decimal)reader["FranchiseFee"];
                    metrics.CommissionSplit = (decimal)reader["CommissionSplit"];
                });

            response.Item = metrics;

            return response;
    
        }

        public PagedItemResponse<TransactionTableItem> GetAllByUser(int userId,int PageIndex, int PageSize)
        {
            PagedItemResponse<TransactionTableItem> pagedItemResponse = new PagedItemResponse<TransactionTableItem>();

            List<TransactionTableItem> transactionList = new List<TransactionTableItem>();

            dataProvider.ExecuteCmd(
                "Transaction_GetAllByUser",
                (parameters) =>
                {
                    parameters.AddWithValue("@UserId", userId);
                    parameters.AddWithValue("@PageIndex", PageIndex);
                    parameters.AddWithValue("@PageSize", PageSize);
                },
                (reader, resultsIndex) =>
                {
                    TransactionTableItem transaction = new TransactionTableItem();
                    transaction.Id = (int)reader["Id"];
                    transaction.UserId = (int)reader["UserId"];
                    transaction.PurchasePrice = (decimal)reader["PurchasePrice"];
                    transaction.TotalCommission = (decimal)reader["TotalCommission"];
                    transaction.AgentCommission = reader.GetSafeDecimalNullable("AgentCommission");
                    transaction.SaleDate = (DateTime)reader["SaleDate"];
                    transaction.CloseDate = (DateTime)reader["CloseDate"];
                    transaction.Status = (string)reader["Status"];
                    transaction.StreetAddress = reader.GetSafeString("StreetAddress");
                    transaction.City = reader.GetSafeString("City");
                    transaction.State = reader.GetSafeString("State");
                    transaction.ZipCode = reader.GetSafeInt32Nullable("ZipCode");
                    transaction.Lead_Id = reader.GetSafeInt32Nullable("Lead_Id");
                    transaction.FullName = reader.GetSafeString("FullName");
                    transaction.Buyer = reader.GetSafeBoolNullable("Buyer"); //(bool)reader["Buyer"];
                    transaction.Seller = reader.GetSafeBoolNullable("Seller");
                    transaction.Lease = reader.GetSafeBoolNullable("Lease");

                    pagedItemResponse.TotalCount = (int)reader["TotalCount"];
                    transactionList.Add(transaction);

                });

            pagedItemResponse.PagedItems = transactionList;

            return pagedItemResponse;

        }

        public ItemsResponse<TransactionTableItem> PdfCreate(int userId)
        {
            ItemsResponse<TransactionTableItem> response = new ItemsResponse<TransactionTableItem>();

            List<TransactionTableItem> transactionList = new List<TransactionTableItem>();

            dataProvider.ExecuteCmd(
                "Transaction_PdfCreate",
                (parameters) =>
                {
                    parameters.AddWithValue("@UserId", userId);
                },
                (reader, resultsIndex) =>
                {
                    TransactionTableItem transaction = new TransactionTableItem();
                    transaction.Id = (int)reader["Id"];
                    transaction.UserId = (int)reader["UserId"];
                    transaction.PurchasePrice = (decimal)reader["PurchasePrice"];
                    transaction.TotalCommission = (decimal)reader["TotalCommission"];
                    transaction.AgentCommission = reader.GetSafeDecimalNullable("AgentCommission");
                    transaction.SaleDate = (DateTime)reader["SaleDate"];
                    transaction.CloseDate = (DateTime)reader["CloseDate"];
                    transaction.Status = (string)reader["Status"];
                    transaction.StreetAddress = reader.GetSafeString("StreetAddress");
                    transaction.City = reader.GetSafeString("City");
                    transaction.State = reader.GetSafeString("State");
                    transaction.ZipCode = reader.GetSafeInt32Nullable("ZipCode");
                    transaction.Lead_Id = reader.GetSafeInt32Nullable("Lead_Id");
                    transaction.FullName = reader.GetSafeString("FullName");
                    transaction.Buyer = (bool)reader["Buyer"];
                    transaction.Seller = (bool)reader["Seller"];
                    transaction.Lease = (bool)reader["Lease"];

                    transactionList.Add(transaction);

                });

            response.Items = transactionList;

            return response;

        }

        public void Update(TransactionUpdateRequest transactionUpdateRequest)
        {
            dataProvider.ExecuteNonQuery(
                "Transaction_Update",
                (parameters) =>
                {
                    parameters.AddWithValue("@Id", transactionUpdateRequest.Id);
                    parameters.AddWithValue("@UserId", transactionUpdateRequest.UserId);
                    parameters.AddWithValue("@PurchasePrice", transactionUpdateRequest.PurchasePrice);
                    parameters.AddWithValue("@TotalCommission", transactionUpdateRequest.TotalCommission);
                    parameters.AddWithValue("@Fees", transactionUpdateRequest.Fees);
                    parameters.AddWithValue("@AgentCommission", transactionUpdateRequest.AgentCommission);
                    parameters.AddWithValue("@BrokerCommission", transactionUpdateRequest.BrokerCommission);
                    parameters.AddWithValue("@SaleDate", transactionUpdateRequest.SaleDate);
                    parameters.AddWithValue("@CloseDate", transactionUpdateRequest.CloseDate);
                    parameters.AddWithValue("@Status", transactionUpdateRequest.Status);
                    parameters.AddWithValue("@StreetAddress", transactionUpdateRequest.StreetAddress);
                    parameters.AddWithValue("@City", transactionUpdateRequest.City);
                    parameters.AddWithValue("@State", transactionUpdateRequest.State);
                    parameters.AddWithValue("@ZipCode", transactionUpdateRequest.ZipCode);
                    parameters.AddWithValue("@LeadId", transactionUpdateRequest.Lead_Id);
                }
        );
        }
        
        public void Delete(int UserId, int transactionId)
        {
            dataProvider.ExecuteNonQuery(
                "Transaction_Delete",
                (parameters) =>
                {
                    parameters.AddWithValue("@Id", transactionId);
                    parameters.AddWithValue("@UserId", UserId);
                },
                (parameters) => { });
        }

        public TransactionTableItem GetById(int id,int userId)
        {
            TransactionTableItem transaction = new TransactionTableItem();

            dataProvider.ExecuteCmd(
                "Transaction_GetById",
                (parameters) =>
                {
                    parameters.AddWithValue("@Id", id);
                    parameters.AddWithValue("@UserId", userId);
                },
                (reader, resultSetIndex) =>
                {
                    transaction.Id = id;
                    transaction.UserId = (int)reader["UserId"];
                    transaction.PurchasePrice = (decimal)reader["PurchasePrice"];
                    transaction.TotalCommission = (decimal)reader["TotalCommission"];
                    transaction.Fees = reader.GetSafeDecimalNullable("Fees");
                    transaction.AgentCommission = reader.GetSafeDecimalNullable("AgentCommission");
                    transaction.BrokerCommission = reader.GetSafeDecimalNullable("BrokerCommission");
                    transaction.SaleDate = (DateTime)reader["SaleDate"];
                    transaction.CloseDate = (DateTime)reader["CloseDate"];
                    transaction.Status = (string)reader["Status"];
                    transaction.StreetAddress = reader.GetSafeString("StreetAddress");
                    transaction.City = reader.GetSafeString("City");
                    transaction.State = reader.GetSafeString("State");
                    transaction.ZipCode = reader.GetSafeInt32Nullable("ZipCode");
                    transaction.Lead_Id = reader.GetSafeInt32Nullable("Lead_Id");
                    transaction.FullName = reader.GetSafeString("FullName");
                    transaction.Buyer = reader.GetSafeBoolNullable("Buyer"); //(bool)reader["Buyer"];
                    transaction.Seller = reader.GetSafeBoolNullable("Seller");
                    transaction.Lease = reader.GetSafeBoolNullable("Lease");
                }
                );

            return transaction;
        }

        public List<TransactionMetric> GetMetrics(int UserId)
        {
            List<TransactionMetric> transactionMetrics = new List<TransactionMetric>();

            dataProvider.ExecuteCmd(
                "Transaction_MetricsByActivity",
                (parameters) =>
                {
                    parameters.AddWithValue("@UserId", UserId);
                },
                (reader, resultsIndex) =>
                {
                    TransactionMetric transactionMetric = new TransactionMetric();
                    transactionMetric.Name = (string)reader["Name"];
                    transactionMetric.LeadsGenerated = (int)reader["LeadsGenerated"];
                    transactionMetric.SalesCount = (int)reader["SalesCount"];
                    transactionMetrics.Add(transactionMetric);
                });

            return transactionMetrics;
        }

        public int Create(TransactionCreateRequest transactionCreateRequest)
        {
            int newId = 0;

            dataProvider.ExecuteNonQuery(
                "Transaction_Insert",
                (parameters) =>
                {
                    parameters.AddWithValue("@UserId", transactionCreateRequest.UserId);
                    parameters.AddWithValue("@PurchasePrice", transactionCreateRequest.PurchasePrice);
                    parameters.AddWithValue("@TotalCommission", transactionCreateRequest.TotalCommission);
                    parameters.AddWithValue("@Fees", transactionCreateRequest.Fees);
                    parameters.AddWithValue("@AgentCommission", transactionCreateRequest.AgentCommission);
                    parameters.AddWithValue("@BrokerCommission", transactionCreateRequest.BrokerCommission);
                    parameters.AddWithValue("@SaleDate", transactionCreateRequest.SaleDate);
                    parameters.AddWithValue("@CloseDate", transactionCreateRequest.CloseDate);
                    parameters.AddWithValue("@Status", transactionCreateRequest.Status);
                    parameters.AddWithValue("@StreetAddress", transactionCreateRequest.StreetAddress);
                    parameters.AddWithValue("@City", transactionCreateRequest.City);
                    parameters.AddWithValue("@State", transactionCreateRequest.State);
                    parameters.AddWithValue("@ZipCode", transactionCreateRequest.ZipCode);
                    parameters.AddWithValue("@Lead_Id", transactionCreateRequest.Lead_Id);
                    parameters.Add("@Id", SqlDbType.Int).Direction = ParameterDirection.Output;
                },
                (parameters) =>
                {
                    newId = (int)parameters["@Id"].Value;
                }
                );

            return newId;

        }
    }
}

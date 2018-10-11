using Sabio.Models.Domain;
using Sabio.Models.Requests;
using Sabio.Models.Responses;
using Sabio.Services;
using Sabio.Services.Security;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Sabio.Web.Controllers
{
    [RoutePrefix("api/transactions")]
    public class TransactionController : ApiController
    {
        readonly TransactionService transactionService;


        public TransactionController(TransactionService transactionService)
        {
            this.transactionService = transactionService;
        }

        [Route, HttpGet, Authorize(Roles = "Agent")]
        public HttpResponseMessage LeadSearch(string Search)
        {
            ItemsResponse<LeadAutoComplete> leads = new ItemsResponse<LeadAutoComplete>();

            int UserId = User.Identity.GetId().Value;

            leads = transactionService.LeadSearch(Search, UserId);

            return Request.CreateResponse(HttpStatusCode.OK, leads);
        }

        [Route("plan"), HttpGet,Authorize(Roles ="Agent")]
        public HttpResponseMessage GetPlanPercentages()
        {
            int UserId;
            ItemResponse<PlanMetricResponse> metrics = new ItemResponse<PlanMetricResponse>();

            if (User.Identity.GetId().HasValue)
            {
                UserId = User.Identity.GetId().Value;
                metrics = transactionService.GetPlanPercentages(UserId);
                return Request.CreateResponse(HttpStatusCode.OK, metrics);
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.OK, new ItemResponse<string> { Item = "No User Id Detected, please login" });
            }
        
        }

        [Route, HttpGet, Authorize(Roles = "Agent")]
        public HttpResponseMessage GetAllByUser(int PageIndex, int PageSize)
        {
            int userId;

            if (User.Identity.GetId().HasValue)
            {
                userId = User.Identity.GetId().Value;
                PagedItemResponse<TransactionTableItem> pagedItemResponse = transactionService.GetAllByUser(userId, PageIndex, PageSize);
                return Request.CreateResponse(HttpStatusCode.OK, pagedItemResponse);
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.OK, new ItemResponse<string> { Item = null });
            }    
        }

        [Route("pdf"), HttpGet, Authorize(Roles = "Agent")]
        public HttpResponseMessage PdfCreate()
        {
            int userId;

            if (User.Identity.GetId().HasValue)
            {
                userId = User.Identity.GetId().Value;
                ItemsResponse<TransactionTableItem> response = transactionService.PdfCreate(userId);
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.OK, new ItemResponse<string> { Item = null });
            }
        }

        [Route("{id:int}"), HttpPut, Authorize(Roles = "Agent")]
        public HttpResponseMessage Update(TransactionUpdateRequest transactionUpdateRequest)
        {
            if (transactionUpdateRequest == null)
            {
                ModelState.AddModelError(" ", "Missing body data");
            }
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            transactionService.Update(transactionUpdateRequest);

            return Request.CreateResponse(HttpStatusCode.OK, new SuccessResponse());
        }

        [Route("{id:int}"), HttpDelete, Authorize(Roles = "Agent")]
        public HttpResponseMessage Delete(int Id)
        {
            int userId;

            if (User.Identity.GetId().HasValue)
            {
                userId = User.Identity.GetId().Value;
                transactionService.Delete(userId, Id);
                return Request.CreateResponse(HttpStatusCode.OK, new SuccessResponse());
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, new ItemResponse<string> { Item = "Transaction not deleted. Login required" });
            }

        }

        [Route("{id:int}"), HttpGet, Authorize(Roles = "Agent")]
        public HttpResponseMessage GetById(int id)
        {
            TransactionTableItem transaction = new TransactionTableItem();
            int userId;
            if (User.Identity.GetId().HasValue)
            {
                userId = User.Identity.GetId().Value;

                transaction = transactionService.GetById(id,userId);

                return Request.CreateResponse(HttpStatusCode.OK, new ItemResponse<TransactionTableItem> { Item = transaction });
            }

            else
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, new ErrorResponse("No Agent Detected"));
            }

        }      

        [Route("metrics"), HttpGet, Authorize(Roles = "Agent")]
        public HttpResponseMessage GetMetrics()
        {
            int UserId;
            List<TransactionMetric> list = new List<TransactionMetric>();

            if (User.Identity.GetId().HasValue)
            {
                UserId = User.Identity.GetId().Value;
                list = transactionService.GetMetrics(UserId);
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest,new ErrorResponse("No Agent Detected"));
            }

            ItemsResponse<TransactionMetric> resp = new ItemsResponse<TransactionMetric>();

            resp.Items = list;

            return Request.CreateResponse(HttpStatusCode.OK, resp);
        }

        [Route, HttpPost, Authorize(Roles = "Agent")]
        public HttpResponseMessage Create(TransactionCreateRequest transactionCreateRequest)
        {
            if (transactionCreateRequest == null)
            {
                ModelState.AddModelError(" ", "Missing body data");
            }
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            int newId = transactionService.Create(transactionCreateRequest);

            return Request.CreateResponse(HttpStatusCode.Created, new ItemResponse<int> { Item = newId });
        }
    }
}
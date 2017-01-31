using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Web.Http;

namespace WebApiToken.Controllers
{
    public class DataController : ApiController
    {
        [AllowAnonymous]
        [HttpGet]
        [Route("api/data/forall")]
        public IHttpActionResult Get ()
        {
            return Ok("Server time:" +DateTime.Now.ToString());
        } 
        [Authorize]
        [HttpGet]
        [Route("api/data/authenticate")]
        public IHttpActionResult GetForAuthenticate() {
            var identity = (ClaimsIdentity)User.Identity;
            return Ok("Hello :" +identity.Name);
        }
        [Authorize(Roles = "admin")]
        [HttpGet]
        [Route("api/data/authorize")]
        public IHttpActionResult GetForAdmin() {
            var identity = (ClaimsIdentity)User.Identity;
            var roles = identity.Claims
                        .Where(o => o.Type == ClaimTypes.Role)
                        .Select(o => o.Value);

            return Ok("Hello :" + identity.Name+ " Role: "+string.Join(",",roles.ToList()));
        }
    }
}

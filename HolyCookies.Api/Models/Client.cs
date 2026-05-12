namespace HolyCookies.Api.Models
{
    public class Client
    {
        public int UserId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Cellphone { get; set; }
        public Address FullAdress{ get; set; }
        public List<Order> Orders { get; set; }
    }
}

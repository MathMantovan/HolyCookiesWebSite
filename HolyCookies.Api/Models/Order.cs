using HolyCookies.Api.Interface;

namespace HolyCookies.Api.Models
{
    public class Order
    {
        public int OrderID { get; set; }
        public int ClientId { get; set; }
        public decimal TotalAmount { get; set; }
        public int CountProduct { get; set; }
        public List<IProduct> Products { get; set; }
        public DateTime CreateDate { get; set; }
    }
}

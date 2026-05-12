namespace HolyCookies.Api.Interface
{
    public interface IProduct
    {
        public string Name { get; set; }
        public decimal Price{ get; set; }
        decimal Discount();
    }
}

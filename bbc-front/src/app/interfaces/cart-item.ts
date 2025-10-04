export interface CartItem {
    id?: number;
    customerId: number;
    productId: number;
    sellerId: number;
    storeName: string;
    productName: string;
    productThumbnailUrl: string;
    productUnitPrice: number;
    productQuantity: number;
    subTotal: number;
}

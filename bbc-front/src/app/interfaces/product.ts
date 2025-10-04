export interface Product {
    id: number;
    title: string;
    thumbnailUrl: string; // Now stores multiple images separated by semicolon
    description: string;
    regularPrice: number;
    salePrice: number;
    category: string;
    stockStatus: string;
    stockCount: number;
    sellerId: number;
    storeName: string;
    status: string;
}

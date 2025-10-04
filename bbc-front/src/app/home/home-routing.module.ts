import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { ProductComponent } from './product/product.component';
import { ContentComponent } from './content/content.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { SearchComponent } from './search/search.component';
import { CartComponent } from './cart/cart.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { CategoryProductsComponent } from './category-products/category-products.component';
import { PublicContactUsComponent } from './contact-us/contact-us.component';

const routes: Routes = [
  {
    path: "", component: HomeComponent, children: [
      { path: "", component: ContentComponent },
      { path: "search", component: SearchComponent },
      { path: "category/:id", component: CategoryProductsComponent },
      { path: "products", component: CategoryProductsComponent },
      { path: "product/:id", component: ProductComponent },
      { path: "cart", component: CartComponent },
      { path: "checkout", component: CheckoutComponent },
      { path: "invoice/:id", component: InvoiceComponent },
      { path: "contact-us", component: PublicContactUsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }

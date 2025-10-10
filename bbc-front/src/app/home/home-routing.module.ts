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
import { ContactUsComponent } from '../customer/contact-us/contact-us.component';
import { StoresComponent } from './footer/stores/stores.component';
import { DeliveryComponent } from './footer/delivery/delivery.component';
import { AfterSalesComponent } from './footer/after-sales/after-sales.component';
import { TermsComponent } from './footer/terms/terms.component';
import { PrivacyComponent } from './footer/privacy/privacy.component';
import { ShippingComponent } from './footer/shipping/shipping.component';
import { SecurityComponent } from './footer/security/security.component';
import { ProposComponent } from './footer/propos/propos.component';
import { EnterpriseComponent } from './footer/enterprise/enterprise.component';

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
      { path: "contact-us", component: PublicContactUsComponent },
        { path: "stores", component: StoresComponent },
            { path: "propos", component: ProposComponent },
            { path: "delivery", component: DeliveryComponent },
            { path: "after-sales", component: AfterSalesComponent },
            { path: "terms", component: TermsComponent },
              { path: "privacy", component: PrivacyComponent },
            { path: "shipping", component: ShippingComponent },
            { path: "security", component: SecurityComponent },
            { path: "enterprise", component: EnterpriseComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }

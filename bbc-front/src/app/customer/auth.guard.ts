import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const token = localStorage.getItem('customer-jwt');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role === 'CUSTOMER') {
        return true;
      }
    }
    localStorage.removeItem('customer-token');
    localStorage.removeItem('customer-jwt');
    this.router.navigate(['customer/auth']);
    return false;
  }
}

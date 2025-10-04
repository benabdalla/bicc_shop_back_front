import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusFr',
})
export class StatusFrPipe implements PipeTransform {
  private statusMap: { [key: string]: string } = {
    Pending: 'En attente',
    Active: 'Actif',
    Inactive: 'Inactif',
    Declined: 'Refusé',
    Paid: 'Payé',
    Processing: 'En cours',
    Canceled: 'Annulée',
    Refunded: 'Remboursé',
    Delivered: 'Livrée',
    Shipped: 'Expédiée',
    'Refund Requested': 'Remboursement demandé',
    'Refund Processing': 'Remboursement en cours',
    // Ajoutez d'autres statuts si besoin
  };

  transform(value: string | undefined): string {
    if (!value) return '';
    return this.statusMap[value] || value;
  }
}

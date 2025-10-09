import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BusinessParameterService } from '../../services/business-parameter.service';
import { ParameterHistory } from '../../shared/models/BusinessParameter';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  recentChanges: ParameterHistory[] = [];
  loading = false;

  constructor(
    private paramService: BusinessParameterService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.canViewParameters()) {
      this.loadRecentChanges();
    }
  }

  loadRecentChanges() {
    this.loading = true;
    this.paramService.getRecentChanges().subscribe({
      next: (changes) => {
        this.recentChanges = changes.slice(0, 5); // Solo los 5 más recientes
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  canViewParameters(): boolean {
    return this.authService.hasPermission('MANAGE_PARAMETERS') ||
           this.authService.isAdmin();
  }

  goToParameters() {
    this.router.navigate(['/business-parameters']);
  }

  getActionBadgeClass(action: string): string {
    const classes: { [key: string]: string } = {
      'CREATE': 'bg-success',
      'UPDATE': 'bg-warning',
      'DELETE': 'bg-danger'
    };
    return classes[action] || 'bg-secondary';
  }
}

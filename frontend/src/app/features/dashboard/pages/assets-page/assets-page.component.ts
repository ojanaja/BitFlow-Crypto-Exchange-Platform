import { Component } from '@angular/core';

@Component({
  selector: 'app-assets-page',
  template: `
    <div class="w-full mx-auto">
      <h1 class="text-2xl font-bold text-slate-900 mb-6">Assets</h1>
      <app-portfolio-summary></app-portfolio-summary>
    </div>
  `,
})
export class AssetsPageComponent {}

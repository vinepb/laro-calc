import { Component, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';

import { I18nService } from './i18n/i18n.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

    constructor(private primengConfig: PrimeNGConfig, private readonly i18nService: I18nService) { }

    ngOnInit() {
        this.i18nService.initialize();
        this.primengConfig.ripple = true;
    }
}

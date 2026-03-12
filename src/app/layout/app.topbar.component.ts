import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';

import { AppLanguage } from '../i18n/i18n.types';
import { I18nService } from '../i18n/i18n.service';
import { LayoutService } from './service/app.layout.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html',
  styleUrls: ['./app.topbar.component.css'],
  providers: [ConfirmationService, MessageService, DialogService],
})
export class AppTopBarComponent implements OnInit, OnDestroy {

  @ViewChild('menubutton') menuButton!: ElementRef;

  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

  @ViewChild('topbarmenu') menu!: ElementRef;

  visibleInfo: boolean = false;
  visibleReference = false;

  readonly languageOptions = this.i18nService.languageOptions;
  infos = [
    'topbar.info.itemData',
    'topbar.info.theme',
    'topbar.info.savedData',
    'topbar.info.skillLearning',
    'topbar.info.itemOptions',
    'topbar.info.magicalElement',
    'topbar.info.leftHand',
    'topbar.info.jobsData',
    'topbar.info.summary',
    'topbar.info.summaryEquipment',
    'topbar.info.itemDescriptions',
  ];

  references: { label: string; link: string; writer: string; date?: string; }[] = [
    {
      label: 'Jobs Improvement Bundle Update (20 June 2024)',
      writer: 'RO GGT',
      link: 'https://ro.gnjoy.in.th/bundleupdate13',
    },
    {
      label: 'Old Headgear & Enchant Improve',
      writer: 'RO GGT',
      link: 'https://ro.gnjoy.in.th/old-headgear-enchant-improve',
    },
    {
      label: 'New Elemental Table Adjustment',
      writer: 'RO GGT',
      link: 'https://ro.gnjoy.in.th/new-elemental-table-adjustment',
    },
    {
      label: 'Quarter 1 Class Improvement 2024',
      writer: 'RO GGT',
      link: 'https://ro.gnjoy.in.th/quarter-1-class-improvement-2024',
    },
    {
      label: 'Bonus JOB LV.70',
      writer: 'RO GGT',
      link: 'https://ro.gnjoy.in.th/newyear_adventure_2024/assets/img/additional/Ragnarok-Today/POP-UP-Job-BONUS.jpg',
    },
    {
      label: 'Class Improvement [Sura, Warlock, Minstrel&Wanderer]',
      writer: 'RO GGT',
      link: 'https://ro.gnjoy.in.th/class-improvement-sura-warlock-minstrelwanderer',
    },
    {
      label: 'Skills Balance (1st, 2nd and transcendent classes skills)',
      writer: 'RO GGT',
      link: 'https://ro.gnjoy.in.th/skills-balance-1st-2nd-and-transcendent-classes-skills',
    },
    {
      label: 'Geffen Magic Tournament Enchant System Update!',
      writer: 'RO GGT',
      link: 'https://ro.gnjoy.in.th/geffen-magic-tournament-enchant-system-update',
    },
    {
      label: 'Develop note ! Balance Skill - Extended Class Level Cap Expansion',
      writer: 'RO GGT',
      link: 'https://ro.gnjoy.in.th/develop-note-extended',
    },
    {
      label: 'Items & Monsters & Skill infomation',
      writer: 'DIVINE PRIDE',
      link: 'https://www.divine-pride.net/',
    },
    {
      label: 'Skill infomation',
      writer: 'IRO Wiki',
      link: 'https://irowiki.org/wiki/Main_Page',
    },
    {
      label: 'ATK',
      writer: 'IRO Wiki',
      link: 'https://irowiki.org/wiki/ATK',
    },
    {
      label: 'MATK',
      writer: 'IRO Wiki',
      link: 'https://irowiki.org/wiki/MATK',
    },
    {
      label: 'Malangdo Enchants',
      writer: 'IRO Wiki',
      link: 'https://irowiki.org/wiki/Malangdo_Enchants',
    },
    {
      label: 'KRO : Jobs improvement project',
      writer: 'Sigma',
      link: 'https://www.divine-pride.net/forum/index.php?/topic/3723-kro-jobs-improvement-project',
    },
    {
      label: 'KRO : Episode 17.2 enchant info : Automatic equipment and Sin weapons.',
      writer: 'Sigma',
      link: 'https://www.divine-pride.net/forum/index.php?/topic/4176-kro-episode-172-enchant-info-automatic-equipment-and-sin-weapons',
    },
    {
      label: 'KRO : Glast Heim challenge mode enchant',
      writer: 'Sigma',
      link: 'https://www.divine-pride.net/forum/index.php?/topic/3879-kro-glast-heim-challenge-mode-enchant/',
    },
    {
      label: 'KRO : Thanatos Tower revamp',
      writer: 'Sigma',
      link: 'https://www.divine-pride.net/forum/index.php?/topic/4277-kro-thanatos-tower-revamp/',
    },
    {
      label: 'KRO : Illusion of Under Water',
      writer: 'Sigma',
      link: 'https://www.divine-pride.net/forum/index.php?/topic/4319-kro-illusion-of-under-water',
    },
    {
      label: 'RO Podcast EP 7 : KRO Patchnote Q4 Review + Debuff Discussion',
      writer: 'Sigma the fallen',
      link: 'https://www.youtube.com/live/xUiYYi6o6gA?si=EdJvXnchwtionL_4&t=1515',
    },
    {
      label: 'Class 4 Skills V2',
      writer: 'Sigma the fallen',
      link: 'https://sigmathefallen.blogspot.com/',
    },
    {
      label: 'Deep Dive into Renewal Stats Part I : Matk & Mdef',
      writer: 'Sigma the fallen',
      link: 'https://web.facebook.com/notes/3202008843255644/',
    },
    {
      label: 'Enchantment System',
      writer: 'Hazy Forest',
      link: 'https://hazyforest.com/equipment:enchantment_system',
    },
    {
      label: 'Enchant Deadly Poison (EDP) Guide',
      writer: 'Assing',
      link: 'https://www.pingbooster.com/th/blog/detail/ragnarok-online-edp-enchant-deadly-poison-assassin',
    },
    {
      label: 'Assassin Hidden Properties: How to Maximize Damage (Please enable subtitles for complete information)',
      writer: '/\\ssing (Assing)',
      link: 'https://youtu.be/WvSbULJ2CGU?si=Ae5vY9teaGZDXSRB',
    },
    {
      label: 'Enchants',
      writer: 'trifectaro.com',
      link: 'https://trifectaro.com/mediawiki/index.php/Enchants',
    },
    {
      label: 'Open-source RO emulator',
      writer: 'rAthena',
      link: 'https://github.com/rathena/rathena',
    },
    // {
    //   label: '',
    //   writer: '',
    //   link: '',
    // },
  ];

  updates: { v: string; date: string; logs: string[]; }[] = [
    {
      v: '0.2.2-BETA',
      date: new Date().toLocaleDateString('en-US'),
      logs: [
        'topbar.updates.0.2.2.1',
        'topbar.updates.0.2.2.2',
        'topbar.updates.0.2.2.3',
        'topbar.updates.0.2.2.4',
        'topbar.updates.0.2.2.5',
        'topbar.updates.0.2.2.6',
      ],
    },
    {
      v: '0.2.1-BETA',
      date: new Date().toLocaleDateString('en-US'),
      logs: [
        'topbar.updates.0.2.1.1',
        'topbar.updates.0.2.1.2',
        'topbar.updates.0.2.1.3',
        'topbar.updates.0.2.1.4',
        'topbar.updates.0.2.1.5',
        'topbar.updates.0.2.1.6',
        'topbar.updates.0.2.1.7',
      ],
    },
    {
      v: '0.1.5-BETA',
      date: new Date().toLocaleDateString('en-US'),
      logs: [
        'topbar.updates.0.1.5.1',
        'topbar.updates.0.1.5.2',
        'topbar.updates.0.1.5.3',
        'topbar.updates.0.1.5.4',
      ],
    },
    {
      v: '0.1.4-BETA',
      date: new Date().toLocaleDateString('en-US'),
      logs: [
        'topbar.updates.0.1.4.1',
        'topbar.updates.0.1.4.2',
        'topbar.updates.0.1.4.3',
        'topbar.updates.0.1.4.4',
      ],
    },
    {
      v: '0.1.3-BETA',
      date: new Date().toLocaleDateString('en-US'),
      logs: [
        'topbar.updates.0.1.3.1',
        'topbar.updates.0.1.3.2',
        'topbar.updates.0.1.3.3',
        'topbar.updates.0.1.3.4',
      ],
    },
    {
      v: '0.1.2-BETA',
      date: new Date().toLocaleDateString('en-US'),
      logs: [
        'topbar.updates.0.1.2.1',
      ],
    },
    {
      v: '0.1.1-BETA',
      date: new Date().toLocaleDateString('en-US'),
      logs: [
        'topbar.updates.0.1.1.1',
      ],
    },
    {
      v: '0.1.0-BETA',
      date: new Date().toLocaleDateString('en-US'),
      logs: [
        'topbar.updates.0.1.0.1',
        'topbar.updates.0.1.0.2',
        'topbar.updates.0.1.0.3',
        'topbar.updates.0.1.0.4',
      ],
    },
  ];
  localVersion = localStorage.getItem('version') || '';
  lastestVersion = this.updates[0].v;

  unreadVersion = this.updates.findIndex((a) => a.v === this.localVersion);
  showUnreadVersion = this.unreadVersion === -1 ? this.updates.length + 1 : this.unreadVersion;

  visibleUpdate = this.lastestVersion !== this.localVersion;

  obs = [] as Subscription[];

  constructor(
    public layoutService: LayoutService,
    private readonly i18nService: I18nService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnDestroy(): void {
    for (const subscription of this.obs) {
      subscription?.unsubscribe();
    }
  }

  ngOnInit(): void {
    // Removed authentication functionality
  }

  get selectedLanguage(): AppLanguage {
    return this.i18nService.currentLanguage;
  }

  set selectedLanguage(language: AppLanguage) {
    if (!language) return;

    this.i18nService.setLanguage(language);
  }



  showUpdateDialog() {
    this.visibleUpdate = true;
  }

  showReferenceDialog() {
    this.visibleReference = true;
  }

  onHideUpdateDialog() {
    // localStorage.setItem('version', this.updates[0].v);
    // this.showUnreadVersion = 0;
  }

  onReadUpdateClick(version: string) {
    localStorage.setItem('version', version);
    this.unreadVersion = this.updates.findIndex((a) => a.v === version);
    this.showUnreadVersion = this.unreadVersion === -1 ? this.updates.length + 1 : this.unreadVersion;
  }

  showInfoDialog() {
    this.visibleInfo = true;
  }

  showItemSearchDialog() {
    this.layoutService.showItemSearchDialog();
  }

  showConfigSidebar() {
    this.layoutService.showConfigSidebar();
  }

  private waitConfirm(message: string, icon?: string) {
    return new Promise((res) => {
      this.confirmationService.confirm({
        message: message,
        header: this.i18nService.t('common.confirmation'),
        icon: icon || 'pi pi-exclamation-triangle',
        accept: () => {
          res(true);
        },
        reject: () => {
          console.log('reject confirm');
          res(false);
        },
      });
    });
  }
}

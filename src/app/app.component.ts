import {Component, ViewChild} from '@angular/core';
import {PDFProgressData, PDFDocumentProxy, PDFSource} from './viewer/viewer.module';

import {PdfViewerComponent} from './viewer/viewer.component';

@Component({
  selector: 'pdf-viewer-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  pdfSrc: string | PDFSource | ArrayBuffer = 'http://iiti.ac.in/people/~tanimad/JavaTheCompleteReference.pdf';

  error: any;
  page: number = 1;
  rotation: number = 0;
  zoom: number = 1.0;
  originalSize: boolean = false;
  pdf: any;
  renderText: boolean = true;
  progressData: PDFProgressData;
  isLoaded: boolean = false;
  stickToPage = false;
  showAll: boolean = false;
  autoresize: boolean = true;
  fitToPage: boolean = false;
  outline: any[];
  isOutlineShown: boolean = false;

  @ViewChild(PdfViewerComponent) private pdfComponent: PdfViewerComponent;

  constructor() {
  }

  /**
   * Set custom path to pdf worker
   */
  setCustomWorkerPath() {
    (<any>window).PDFJS.workerSrc = '/lib/pdfjs-dist/build/pdf.worker.js';
  }

  incrementPage(amount: number) {
    this.page += amount;
  }

  incrementZoom(amount: number) {
    this.zoom += amount;
  }

  rotate(angle: number) {
    this.rotation += angle;
  }

  /**
   * Render PDF preview on selecting file
   */
  onFileSelected() {
    let $pdf: any = document.querySelector('#file');

    if (typeof (FileReader) !== 'undefined') {
      let reader = new FileReader();

      reader.onload = (e: any) => {
        this.pdfSrc = e.target.result;
      };

      reader.readAsArrayBuffer($pdf.files[0]);
    }
  }

  /**
   * Get pdf information after it's loaded
   * @param pdf
   */
  afterLoadComplete(pdf: PDFDocumentProxy) {
    this.pdf = pdf;
    this.isLoaded = true;

    this.loadOutline();
  }

  /**
   * Get outline
   */
  loadOutline() {
    this.pdf.getOutline().then((outline: any[]) => {
      this.outline = outline;
    });
  }

  /**
   * Handle error callback
   *
   * @param error
   */
  onError(error: any) {
    this.error = error; // set error

    if (error.name === 'PasswordException') {
      const password = prompt('This document is password protected. Enter the password:');

      if (password) {
        this.error = null;
        this.setPassword(password);
      }
    }
  }

  setPassword(password: string) {
    let newSrc;

    if (this.pdfSrc instanceof ArrayBuffer) {
      newSrc = {data: this.pdfSrc};
    } else if (typeof this.pdfSrc === 'string') {
      newSrc = {url: this.pdfSrc};
    } else {
      newSrc = {...this.pdfSrc};
    }

    newSrc.password = password;

    this.pdfSrc = newSrc;
  }

  /**
   * Pdf loading progress callback
   * @param {PDFProgressData} progressData
   */
  onProgress(progressData: PDFProgressData) {
    // console.log(progressData);
    this.progressData = progressData;
    this.isLoaded = false;
    this.error = null; // clear error
  }

  getInt(value: number): number {
    return Math.round(value);
  }

  /**
   * Navigate to destination
   * @param destination
   */
  navigateTo(destination: any) {
    this.pdfComponent.pdfLinkService.navigateTo(destination);
  }

  /**
   * Scroll view
   */
  scrollToPage() {
    this.pdfComponent.pdfViewer.scrollPageIntoView({
      pageNumber: 3
    });
  }

  /**
   * Page rendered callback, which is called when a page is rendered (called multiple times)
   *
   * @param {CustomEvent} e
   */
  pageRendered(e: CustomEvent) {
    // console.log('(page-rendered)', e);
  }
}

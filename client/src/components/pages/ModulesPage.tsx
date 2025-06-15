import React, { useState } from "react";

interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  category: string;
}

const modules: Module[] = [
  {
    id: 'keyword-generator',
    title: 'Anahtar Kelime Üretici',
    description: 'İşiniz için anahtar kelimeler üretin',
    icon: (
      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="48" width="48" xmlns="http://www.w3.org/2000/svg">
        <path fill="none" d="M0 0h24v24H0V0z"></path>
        <path d="M7 9H2V7h5v2zm0 3H2v2h5v-2zm13.59 7l-3.83-3.83c-.8.52-1.74.83-2.76.83-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5c0 1.02-.31 1.96-.83 2.75L22 17.59 20.59 19zM17 11c0-1.65-1.35-3-3-3s-3 1.35-3 3 1.35 3 3 3 3-1.35 3-3zM2 19h10v-2H2v2z"></path>
      </svg>
    ),
    route: 'keyword-generator',
    category: 'SEO'
  },
  {
    id: 'wp-comment-generator',
    title: 'Wordpress Yorum Üretici',
    description: 'Web siteniz veya içeriğiniz için gerçek yorumlar üretin',
    icon: (
      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="48" width="48" xmlns="http://www.w3.org/2000/svg">
        <path d="M61.7 169.4l101.5 278C92.2 413 43.3 340.2 43.3 256c0-30.9 6.6-60.1 18.4-86.6zm337.9 75.9c0-26.3-9.4-44.5-17.5-58.7-10.8-17.5-20.9-32.4-20.9-49.9 0-19.6 14.8-37.8 35.7-37.8.9 0 1.8.1 2.8.2-37.9-34.7-88.3-55.9-143.7-55.9-74.3 0-139.7 38.1-177.8 95.9 5 .2 9.7.3 13.7.3 22.2 0 56.7-2.7 56.7-2.7 11.5-.7 12.8 16.2 1.4 17.5 0 0-11.5 1.3-24.3 2l77.5 230.4L249.8 247l-33.1-90.8c-11.5-.7-22.3-2-22.3-2-11.5-.7-10.1-18.2 1.3-17.5 0 0 35.1 2.7 56 2.7 22.2 0 56.7-2.7 56.7-2.7 11.5-.7 12.8 16.2 1.4 17.5 0 0-11.5 1.3-24.3 2l76.9 228.7 21.2-70.9c9-29.4 16-50.5 16-68.7zm-139.9 29.3l-63.8 185.5c19.1 5.6 39.2 8.7 60.1 8.7 24.8 0 48.5-4.3 70.6-12.1-.6-.9-1.1-1.9-1.5-2.9l-65.4-179.2zm183-120.7c.9 6.8 1.4 14 1.4 21.9 0 21.6-4 45.8-16.2 76.2l-65 187.9C426.2 403 468.7 334.5 468.7 256c0-37-9.4-71.8-26-102.1zM504 256c0 136.8-111.3 248-248 248C119.2 504 8 392.7 8 256 8 119.2 119.2 8 256 8c136.7 0 248 111.2 248 248zm-11.4 0c0-130.5-106.2-236.6-236.6-236.6C125.5 19.4 19.4 125.5 19.4 256S125.6 492.6 256 492.6c130.5 0 236.6-106.1 236.6-236.6z"></path>
      </svg>
    ),
    route: 'wp-comment-generator',
    category: 'WordPress'
  },
  {
    id: 'title-generator',
    title: 'Makale Başlığı Üretici',
    description: 'Özgün makale başlıkları üretin',
    icon: (
      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="48" width="48" xmlns="http://www.w3.org/2000/svg">
        <path fill="none" d="M0 0h24v24H0V0z"></path>
        <path d="M5 4v3h5.5v12h3V7H19V4H5z"></path>
      </svg>
    ),
    route: 'title-generator',
    category: 'SEO'
  },
  {
    id: 'about-generator',
    title: 'Hakkımda Yazısı Üretici',
    description: 'Dilediğiniz dilde hakkımda yazısı üretin',
    icon: (
      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" height="48" width="48" xmlns="http://www.w3.org/2000/svg">
        <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h274.9c-2.4-6.8-3.4-14-2.6-21.3l6.8-60.9 1.2-11.1 7.9-7.9 77.3-77.3c-24.5-27.7-60-45.5-99.9-45.5zm45.3 145.3l-6.8 61c-1.1 10.2 7.5 18.8 17.6 17.6l60.9-6.8 137.9-137.9-71.7-71.7-137.9 137.8zM633 268.9L595.1 231c-9.3-9.3-24.5-9.3-33.8 0l-37.8 37.8-4.1 4.1 71.8 71.7 41.8-41.8c9.3-9.4 9.3-24.5 0-33.9z"></path>
      </svg>
    ),
    route: 'about-generator',
    category: 'Genel'
  },
  {
    id: 'cv-writer',
    title: 'CV Yazarı',
    description: 'Kişisel bilgilerinizle istediğiniz dilde cv metni üretin',
    icon: (
      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="48" width="48" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1h-3zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5zM.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5z"></path>
        <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"></path>
      </svg>
    ),
    route: 'cv-writer',
    category: 'Genel'
  },
  {
    id: 'service-description',
    title: 'Hizmet Açıklaması Yazarı',
    description: 'Verdiğiniz Hizmetler için açıklamalar üretin',
    icon: (
      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="48" width="48" xmlns="http://www.w3.org/2000/svg">
        <path fill="none" d="M0 0h24v24H0z"></path>
        <path d="M16.24 11.51l1.57-1.57-3.75-3.75-1.57 1.57-4.14-4.13c-.78-.78-2.05-.78-2.83 0l-1.9 1.9c-.78.78-.78 2.05 0 2.83l4.13 4.13L3 17.25V21h3.75l4.76-4.76 4.13 4.13c.95.95 2.23.6 2.83 0l1.9-1.9c.78-.78.78-2.05 0-2.83l-4.13-4.13zm-7.06-.44L5.04 6.94l1.89-1.9L8.2 6.31 7.02 7.5l1.41 1.41 1.19-1.19 1.45 1.45-1.89 1.9zm7.88 7.89l-4.13-4.13 1.9-1.9 1.45 1.45-1.19 1.19 1.41 1.41 1.19-1.19 1.27 1.27-1.9 1.9zM20.71 7.04a.996.996 0 000-1.41l-2.34-2.34c-.47-.47-1.12-.29-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
      </svg>
    ),
    route: 'service-description',
    category: 'Genel'
  },
  {
    id: 'product-description',
    title: 'Ürün Açıklaması Üretici',
    description: 'E-ticaret için SEO uyumlu ürün açıklamaları',
    icon: (
      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="48" width="48" xmlns="http://www.w3.org/2000/svg">
        <path fill="none" d="M0 0h24v24H0V0z"></path>
        <path d="M21.41 11.41l-8.83-8.83c-.37-.37-.88-.58-1.41-.58H4c-1.1 0-2 .9-2 2v7.17c0 .53.21 1.04.59 1.41l8.83 8.83c.78.78 2.05.78 2.83 0l7.17-7.17c.78-.78.78-2.04-.01-2.83zM12.83 20L4 11.17V4h7.17L20 12.83 12.83 20z"></path>
        <circle cx="6.5" cy="6.5" r="1.5"></circle>
      </svg>
    ),
    route: 'product-description',
    category: 'SEO'
  },
  {
    id: 'faq-generator',
    title: 'Sıkça Sorulan Sorular',
    description: 'İstediğin konuda SSS ve cevapları üret',
    icon: (
      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="48" width="48" xmlns="http://www.w3.org/2000/svg">
        <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
        <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0 1 30.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1 0 80 0 40 40 0 1 0-80 0z"></path>
      </svg>
    ),
    route: 'faq-generator',
    category: 'Genel'
  },
  {
    id: 'rewrite-tool',
    title: 'Yeniden Yazdır',
    description: 'İstediğin metni özgünce yeniden yazdır',
    icon: (
      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true" height="48" width="48" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
      </svg>
    ),
    route: 'url-rewrite',
    category: 'Genel'
  },
  {
    id: 'google-review',
    title: 'Google Yorum Üretici',
    description: 'Google maps için gerçek yorumlar üretin',
    icon: (
      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" role="img" viewBox="0 0 24 24" height="48" width="48" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.527 4.799c1.212 2.608.937 5.678-.405 8.173-1.101 2.047-2.744 3.74-4.098 5.614-.619.858-1.244 1.75-1.669 2.727-.141.325-.263.658-.383.992-.121.333-.224.673-.34 1.008-.109.314-.236.684-.627.687h-.007c-.466-.001-.579-.53-.695-.887-.284-.874-.581-1.713-1.019-2.525-.51-.944-1.145-1.817-1.79-2.671L19.527 4.799zM8.545 7.705l-3.959 4.707c.724 1.54 1.821 2.863 2.871 4.18.247.31.494.622.737.936l4.984-5.925-.029.01c-1.741.601-3.691-.291-4.392-1.987a3.377 3.377 0 0 1-.209-.716c-.063-.437-.077-.761-.004-1.198l.001-.007zM5.492 3.149l-.003.004c-1.947 2.466-2.281 5.88-1.117 8.77l4.785-5.689-.058-.05-3.607-3.035zM14.661.436l-3.838 4.563a.295.295 0 0 1 .027-.01c1.6-.551 3.403.15 4.22 1.626.176.319.323.683.377 1.045.068.446.085.773.012 1.22l-.003.016 3.836-4.561A8.382 8.382 0 0 0 14.67.439l-.009-.003zM9.466 5.868L14.162.285l-.047-.012A8.31 8.31 0 0 0 11.986 0a8.439 8.439 0 0 0-6.169 2.766l-.016.018 3.665 3.084z"></path>
      </svg>
    ),
    route: 'google-review',
    category: 'Google'
  },
  {
    id: 'google-ads-title',
    title: 'Google Ads Başlığı',
    description: 'Dönüşüm odaklı Google Ads başlıkları üretin',
    icon: (
      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="48" width="48" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.93 13.5h4.14L12 7.98 9.93 13.5zM12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
      </svg>
    ),
    route: 'google-ads-title',
    category: 'Google'
  },
  {
    id: 'google-ads-description',
    title: 'Google Ads Açıklaması',
    description: 'Etkileyici Google Ads açıklamaları oluşturun',
    icon: (
      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="48" width="48" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V9h2v2zm0-4h-2V5h2v2z"></path>
      </svg>
    ),
    route: 'google-ads-description',
    category: 'Google'
  },
  {
    id: 'facebook-ads-title',
    title: 'Facebook Ads Başlığı',
    description: 'Dikkat çekici Facebook reklam başlıkları',
    icon: (
      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="48" width="48" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
      </svg>
    ),
    route: 'facebook-ads-title',
    category: 'Facebook'
  },
  {
    id: 'facebook-ads-text',
    title: 'Facebook Ads Ana Metin',
    description: 'Etkili Facebook reklam metinleri yazın',
    icon: (
      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="48" width="48" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"></path>
        <polyline points="14,2 14,8 20,8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10,9 9,9 8,9"></polyline>
      </svg>
    ),
    route: 'facebook-ads-text',
    category: 'Facebook'
  },
  {
    id: 'homepage-content',
    title: 'Ana Sayfa Yazısı',
    description: 'Profesyonel ana sayfa içerikleri oluşturun',
    icon: (
      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="48" width="48" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path>
      </svg>
    ),
    route: 'homepage-content',
    category: 'Genel'
  },
  {
    id: 'contact-page',
    title: 'İletişim Sayfası Yazısı',
    description: 'Güven veren iletişim sayfası metinleri',
    icon: (
      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="48" width="48" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"></path>
      </svg>
    ),
    route: 'contact-page',
    category: 'Genel'
  },
  {
    id: 'customer-review',
    title: 'Müşteri Yorumu',
    description: 'Gerçekçi müşteri yorum ve değerlendirmeleri',
    icon: (
      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="48" width="48" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 13.5l-1.41-1.41L9.5 16.17 7.91 14.59 6.5 16l3 3 5-5-1.5-1.5z"></path>
      </svg>
    ),
    route: 'customer-review',
    category: 'Genel'
  },
  {
    id: 'ai-content-preview',
    title: 'Etkileşimli İçerik Önizlemesi',
    description: 'Gerçek zamanlı AI önerileri ile canlı içerik önizlemesi',
    icon: (
      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="48" width="48" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
      </svg>
    ),
    route: 'ai-content-preview',
    category: 'AI'
  },
  {
    id: 'voice-to-text',
    title: 'Sesli İçerik Oluşturucu',
    description: 'Çok dilli sesten metne dönüştürme ile içerik üretin',
    icon: (
      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="48" width="48" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"></path>
      </svg>
    ),
    route: 'voice-to-text',
    category: 'AI'
  },
  {
    id: 'collaborative-editor',
    title: 'İşbirliği Editörü',
    description: 'Sürüm geçmişi ve ekip yorumları ile işbirlikçi düzenleme',
    icon: (
      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="48" width="48" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-4h2v2h2v2H4zm0-4V6h2v2h2v2H6v2H4zm4 4v-4h2v4H8zm0-6V6h2v6H8zm4 6v-4h2v4h-2zm0-6V6h2v6h-2zm4 6v-4h2v4h-2z"></path>
      </svg>
    ),
    route: 'collaborative-editor',
    category: 'AI'
  },
  {
    id: 'ai-quality-scorer',
    title: 'AI Kalite Puanlama',
    description: 'Özelleştirilebilir yapay zeka içerik kalitesi değerlendirme sistemi',
    icon: (
      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="48" width="48" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"></path>
      </svg>
    ),
    route: 'ai-quality-scorer',
    category: 'AI'
  },
  {
    id: 'content-localization',
    title: 'İçerik Yerelleştirme',
    description: 'Tek tıkla içerik yerelleştirme ve kültürel adaptasyon',
    icon: (
      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="48" width="48" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"></path>
      </svg>
    ),
    route: 'content-localization',
    category: 'AI'
  }
];

interface ModulesPageProps {
  setLoading: (loading: boolean) => void;
}

export default function ModulesPage({ setLoading }: ModulesPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');

  const categories = ['Tümü', 'SEO', 'Google', 'Instagram', 'Facebook', 'Youtube', 'Genel', 'Coder', 'Twitter', 'Resim', 'AI'];

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tümü' || module.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleModuleClick = (module: Module) => {
    setLoading(true);
    window.location.href = `?page=${module.route}`;
  };

  return (
    <div className="pb-20">
      <div style={{ display: 'flex' }}>
        <div className="p-2 md:p-8">
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '24px' }}>
            Tüm Modüller
          </h1>
          
          {/* Search Bar */}
          <div className="ml-2 mt-8 md:mt-4">
            <input
              className="shadow-md w-[78%] md:w-[320px] h-[45px] p-2 pl-5"
              placeholder="Modül Ara"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                borderRadius: '4px',
                borderColor: 'rgb(112, 112, 112)',
                outline: 'none'
              }}
            />
            <button
              className="w-[20%] md:w-[80px] h-[45px] bg-white shadow-md hover:shadow-xl"
              style={{
                borderLeftWidth: '1px',
                borderColor: 'rgb(112, 112, 112)',
                borderTopRightRadius: '4px',
                borderBottomRightRadius: '4px',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '20px',
                color: 'rgb(51, 51, 51)'
              }}
            >
              Ara
            </button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`mt-4 ml-2 px-2 py-1 bg-white shadow-md hover:shadow-xl rounded-md ${
                  selectedCategory === category 
                    ? 'outline outline-2 outline-[#5356FF]' 
                    : 'outline outline-0 hover:outline-1 outline-[#5356FF]'
                }`}
              >
                <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: '500' }}>
                  #{category}
                </p>
              </button>
            ))}
          </div>

          {/* Modules Grid */}
          <div className="flex flex-wrap">
            {filteredModules.map((module) => (
              <button
                key={module.id}
                onClick={() => handleModuleClick(module)}
                className="bg-white w-[48%] md:w-[280px] h-[180px] md:h-[240px] rounded-md shadow-lg hover:shadow-xl p-4 relative outline outline-0 hover:outline-1 md:ml-4 text-center flex flex-col items-center mt-8 md:mt-6"
              >
                <div className="mt-2">
                  {module.icon}
                </div>
                <h2 style={{ 
                  fontFamily: 'Poppins, sans-serif', 
                  fontSize: '20px', 
                  marginTop: '20px' 
                }}>
                  {module.title}
                </h2>
                <p style={{ 
                  fontFamily: 'Poppins, sans-serif', 
                  fontWeight: '300', 
                  marginTop: '10px' 
                }}>
                  {module.description}
                </p>
                <div className="bg-[#5356FF] w-[80px] h-[40px] flex items-center justify-center rounded-md absolute bottom-2">
                  <p style={{ 
                    fontFamily: 'Poppins, sans-serif', 
                    fontWeight: '500', 
                    color: 'white' 
                  }}>
                    Yazdır
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
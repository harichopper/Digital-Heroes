/**
 * SweetAlert2 helper functions — centralized, themed for Digital Heroes.
 * All alerts use the platform's dark design system colors.
 *
 * Usage: import { swal } from '@/lib/swal'
 */

// Dynamic import to avoid SSR issues
const getSwal = () => import('sweetalert2').then((m) => m.default);

const baseConfig = {
  background: '#111827',
  color: '#f8fafc',
  confirmButtonColor: '#10b981',
  cancelButtonColor: '#475569',
  customClass: {
    popup: 'swal-popup',
    title: 'swal-title',
    htmlContainer: 'swal-html',
    confirmButton: 'swal-btn-confirm',
    cancelButton: 'swal-btn-cancel',
    icon: 'swal-icon',
  },
};

export const swal = {
  /** Green success toast (top-right, auto-closes) */
  success: async (title: string, text?: string) => {
    const Swal = await getSwal();
    return Swal.fire({
      ...baseConfig,
      icon: 'success',
      title,
      text,
      timer: 2500,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
      showClass: { popup: 'swal-animate-in' },
    });
  },

  /** Red error toast */
  error: async (title: string, text?: string) => {
    const Swal = await getSwal();
    return Swal.fire({
      ...baseConfig,
      icon: 'error',
      title,
      text,
      timer: 4000,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
    });
  },

  /** Yellow warning toast */
  warning: async (title: string, text?: string) => {
    const Swal = await getSwal();
    return Swal.fire({
      ...baseConfig,
      icon: 'warning',
      title,
      text,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
    });
  },

  /** Blue info toast */
  info: async (title: string, text?: string) => {
    const Swal = await getSwal();
    return Swal.fire({
      ...baseConfig,
      icon: 'info',
      title,
      text,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
    });
  },

  /** Confirmation dialog — returns true if confirmed */
  confirm: async (
    title: string,
    text: string,
    confirmText = 'Yes, proceed',
    isDanger = false
  ): Promise<boolean> => {
    const Swal = await getSwal();
    const result = await Swal.fire({
      ...baseConfig,
      icon: isDanger ? 'warning' : 'question',
      title,
      html: `<p style="color:#94a3b8">${text}</p>`,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancel',
      confirmButtonColor: isDanger ? '#ef4444' : '#10b981',
      reverseButtons: true,
      showClass: { popup: 'swal-animate-scale' },
    });
    return result.isConfirmed;
  },

  /** Animated loading dialog — returns dismiss function */
  loading: async (title = 'Processing...', text?: string) => {
    const Swal = await getSwal();
    Swal.fire({
      ...baseConfig,
      title,
      html: text
        ? `<p style="color:#94a3b8;margin-bottom:1rem">${text}</p><div class="swal-spinner"></div>`
        : '<div class="swal-spinner"></div>',
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
    });
    return () => Swal.close();
  },

  /** Victory celebration for winners */
  winner: async (matchCount: number, amount: string) => {
    const Swal = await getSwal();
    await Swal.fire({
      ...baseConfig,
      title: `🎉 You Won!`,
      html: `
        <div style="text-align:center">
          <div style="font-size:3rem;font-weight:800;background:linear-gradient(135deg,#10b981,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:1rem 0">${amount}</div>
          <p style="color:#94a3b8">${matchCount}-number match! Upload your proof to claim your prize.</p>
        </div>
      `,
      confirmButtonText: 'Upload Proof',
      confirmButtonColor: '#10b981',
      showClass: { popup: 'swal-animate-bounce' },
    });
  },
};

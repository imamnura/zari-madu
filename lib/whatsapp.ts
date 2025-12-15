// WhatsApp utility functions

export function getWhatsAppLink(phoneNumber: string, message: string): string {
  const cleanNumber = phoneNumber.replace(/\D/g, "");
  const encodedMessage = encodeURIComponent(message);

  // Detect if mobile or desktop
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    return `whatsapp://send?phone=${cleanNumber}&text=${encodedMessage}`;
  } else {
    return `https://web.whatsapp.com/send?phone=${cleanNumber}&text=${encodedMessage}`;
  }
}

export function openWhatsApp(phoneNumber: string, message: string): void {
  const link = getWhatsAppLink(phoneNumber, message);
  window.open(link, "_blank");
}

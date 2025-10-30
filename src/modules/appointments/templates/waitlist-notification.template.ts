/**
 * Email Template: Waitlist Notification
 * 
 * Kompaktni HTML email template koji se šalje klijentima kada se termin sa liste čekanja oslobodi.
 * Ultra-kompaktan dizajn sa velikim CTA dugmetom za prihvatanje termina.
 */

export interface WaitlistEmailData {
    claimLink: string;
    client: {
        firstName?: string;
        lastName?: string;
    };
    employee: {
        firstName?: string;
        lastName?: string;
    };
    service: {
        name?: string;
    };
    facility: {
        name?: string;
    };
    formattedDate: string;
    startHour: number;
    endHour: number;
    titleText?: string;
}

/**
 * Formatira sat (broj) u format HH:MM (npr. 14.5 -> "14:30")
 */
function formatTime(hour: number): string {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Generiše HTML email za notifikaciju o dostupnom terminu sa liste čekanja.
 */
export function generateWaitlistNotificationEmail(data: WaitlistEmailData): string {
    const {
        claimLink,
        client,
        employee,
        service,
        facility,
        formattedDate,
        startHour,
        endHour,
        titleText = 'Vaš termin je dostupan!'
    } = data;

    return `<!DOCTYPE html>
<html lang="sr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Termin dostupan</title>
</head>
<body style="margin:0;padding:0;font-family: system-ui, sans-serif; background: #f6f6fa;">
<div style="max-width:380px;margin:0 auto;background:#fff;box-shadow:0 2px 10px #0001;">
  <div style="background:linear-gradient(90deg,#667eea,#764ba2);color:#fff;padding:10px 12px 6px 12px;text-align:center;font-size:17px;font-weight:bold;">
    🎉 ${titleText}
  </div>
  <div style="padding:12px 12px 0 12px;">
    <div style="color:#333;font-size:12px;margin-bottom:9px;line-height:1.5;">
      Poštovani/a <b>${client?.firstName || ''} ${client?.lastName || ''}</b>,<br/>
      Termin koji ste tražili je sada dostupan i možete ga rezervisati.
    </div>
    <table style="width:100%;font-size:11px;color:#222;border-collapse:collapse;margin-bottom:10px;">
      <tr><td>Usluga:</td><td align="right"><b>${service?.name || ''}</b></td></tr>
      <tr><td>Zaposleni:</td><td align="right">${employee?.firstName || ''} ${employee?.lastName || ''}</td></tr>
      <tr><td>Salon:</td><td align="right">${facility?.name || ''}</td></tr>
      <tr><td>Datum:</td><td align="right">${formattedDate}</td></tr>
      <tr><td>Vreme:</td><td align="right">${formatTime(startHour)}-${formatTime(endHour)}</td></tr>
    </table>
    <a href="${claimLink}" style="display:block;width:100%;background:linear-gradient(90deg,#667eea,#764ba2);color:#fff;text-align:center;text-decoration:none;padding:11px 0;border-radius:6px;font-size:15px;font-weight:bold;margin-bottom:10px;box-shadow:0 2px 7px #667eea40;">✅ PRIHVATI TERMIN</a>
    <div style="margin:0 0 8px 0;font-size:11px;color:#92400e;background:#ffe6b9;border-left:2.5px solid #f59e0b;padding:5px 7px 5px 8px;">
      ⚠️ Ovaj termin je dostupan ograničeno vreme. Prihvatite što pre!
    </div>
    <div style="border-top:1px solid #eee;padding:5px 0 2px 0;text-align:center;font-size:10px;color:#aaa;">
      Flowzen Salon. Ako imate pitanja, kontaktirajte nas.<br>© 2025 Flowzen
    </div>
  </div>
</div>
</body>
</html>`;
}


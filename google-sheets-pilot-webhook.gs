/**
 * ============================================================================
 * IT Department Nigeria (itdepartment.ng) — Google Sheets Pilot Lead Receiver
 * ============================================================================
 * HOW TO SETUP IN 60 SECONDS:
 * 1. Create a new Google Sheet (e.g. "IT Department — 7-Day Free Pilot Leads").
 * 2. In the top menu, click Extensions -> Apps Script.
 * 3. Delete any code in the editor, paste this entire file, and press Save (Ctrl+S).
 * 4. Click "Deploy" (top right) -> "New deployment".
 * 5. Select type: "Web app":
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 6. Click "Deploy", authorize access, and copy the "Web app URL" (ends with /exec).
 * 7. Paste that URL into:
 *    - `index.html` inside `data-google-sheet-url="https://script.google.com/macros/s/.../exec"`
 *    - OR in Vercel Environment Variables as `GOOGLE_SHEET_WEBHOOK_URL`
 * ============================================================================
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Automatically create the header row if the sheet is brand new
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp (WAT)',
        'Full Name',
        'Role',
        'Organisation Name',
        'Work Email & Phone',
        'Staff Computers (PCs)',
        'Status',
        'Source URL'
      ]);
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
    }

    var raw = e.postData ? e.postData.contents : '{}';
    var data = JSON.parse(raw);

    var watTime = Utilities.formatDate(
      new Date(),
      'Africa/Lagos',
      'yyyy-MM-dd HH:mm:ss'
    );

    sheet.appendRow([
      watTime,
      data.full_name || '',
      data.role || '',
      data.company_name || '',
      data.contact || '',
      data.staff_pcs || 20,
      'New 7-Day Pilot Request',
      data.source || 'itdepartment.ng'
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true, message: 'Lead saved to Google Sheet' })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}


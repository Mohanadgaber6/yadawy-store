const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { getDb } = require('../database/connection');

// Target recipient email
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'yadawy1980@gmail.com';
const BRAND_NAME = 'Yadawy — Luxury Handwoven Rugs & Kilim';
const BRAND_WEBSITE = process.env.SITE_URL || 'http://localhost:3000';

/**
 * Configure Nodemailer Transporter
 */
let transporter = null;

function getTransporter() {
    if (transporter) return transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    } else {
        // Fallback for local development / testing without live SMTP credentials
        transporter = {
            sendMail: async (mailOptions) => {
                console.log('\n================== [YADAWY EMAIL NOTIFICATION] ==================');
                console.log(`To: ${mailOptions.to}`);
                console.log(`Subject: ${mailOptions.subject}`);
                console.log(`From: ${mailOptions.from || '"Yadawy Store" <noreply@yadawy.com>'}`);
                console.log('Attachments count:', mailOptions.attachments ? mailOptions.attachments.length : 0);
                console.log('-----------------------------------------------------------------');
                console.log(mailOptions.text || '[HTML Email Generated]');
                console.log('=================================================================\n');
                return { messageId: `mock-${Date.now()}` };
            }
        };
    }

    return transporter;
}

/**
 * Helper to escape HTML characters
 */
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Format timestamp nicely
 */
function formatDateTime(date = new Date()) {
    try {
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    } catch (e) {
        return new Date().toISOString();
    }
}

/**
 * Prepare inline attachments for product images & fallbacks
 */
function prepareOrderEmailAttachments(order) {
    const attachments = [];
    const items = order.items || [];
    let db = null;
    try {
        db = getDb();
    } catch (e) {
        // database might not be initialized in isolated tests
    }

    // Prepare logo/placeholder attachment
    const logoPath = path.join(process.cwd(), 'public/images/logo.png');
    let hasLogoAttachment = false;
    if (fs.existsSync(logoPath)) {
        attachments.push({
            filename: 'logo.png',
            path: logoPath,
            cid: 'brand-logo',
            contentDisposition: 'inline'
        });
        hasLogoAttachment = true;
    }

    items.forEach((item, index) => {
        let imageRelativePath = item.product_image;

        // If no image path provided, look up from database
        if (!imageRelativePath && item.product_id && db) {
            try {
                const imgRow = db.prepare(`
                    SELECT image_path, thumbnail_path 
                    FROM product_images 
                    WHERE product_id = ? 
                    ORDER BY is_primary DESC, display_order ASC 
                    LIMIT 1
                `).get(item.product_id);
                if (imgRow) {
                    imageRelativePath = imgRow.thumbnail_path || imgRow.image_path;
                }
            } catch (e) {
                console.warn('[EmailService] Image lookup error for product:', item.product_id, e.message);
            }
        }

        let resolvedSrc = null;

        if (imageRelativePath) {
            // If it's a URL
            if (imageRelativePath.startsWith('http://') || imageRelativePath.startsWith('https://')) {
                if (imageRelativePath.includes('localhost') || imageRelativePath.includes('127.0.0.1')) {
                    try {
                        const parsedUrl = new URL(imageRelativePath);
                        imageRelativePath = parsedUrl.pathname;
                    } catch (e) {
                        // ignore parse error
                    }
                } else {
                    // Valid public URL
                    resolvedSrc = imageRelativePath;
                }
            }

            // Check local file path if not resolved
            if (!resolvedSrc) {
                const cleanRel = imageRelativePath.replace(/^\/+/, '');
                const localPath = path.join(process.cwd(), cleanRel);

                if (fs.existsSync(localPath)) {
                    const cidId = `prod-img-${index}`;
                    attachments.push({
                        filename: path.basename(localPath),
                        path: localPath,
                        cid: cidId,
                        contentDisposition: 'inline'
                    });
                    resolvedSrc = `cid:${cidId}`;
                } else {
                    // Check fallback without _thumb or with original name
                    const altRel = cleanRel.replace('_thumb', '');
                    const altPath = path.join(process.cwd(), altRel);
                    if (fs.existsSync(altPath)) {
                        const cidId = `prod-img-${index}`;
                        attachments.push({
                            filename: path.basename(altPath),
                            path: altPath,
                            cid: cidId,
                            contentDisposition: 'inline'
                        });
                        resolvedSrc = `cid:${cidId}`;
                    }
                }
            }
        }

        // Fallback placeholder if no image found
        if (!resolvedSrc) {
            resolvedSrc = hasLogoAttachment ? 'cid:brand-logo' : `${BRAND_WEBSITE}/images/logo.png`;
        }

        item._emailImageSrc = resolvedSrc;
    });

    return { attachments };
}

/**
 * Common Official Email Header HTML (Burgundy & Gold Luxury Styling)
 */
function getEmailHeaderHtml(badgeTitle, subtitle) {
    return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #5B0E2D; border-radius: 8px 8px 0 0; padding: 32px 24px 28px; text-align: center; border-bottom: 3px solid #C5A880;">
            <tr>
                <td align="center">
                    <div style="font-family: 'Cinzel', Georgia, serif; font-size: 28px; font-weight: 700; color: #FFFFFF; letter-spacing: 5px; text-transform: uppercase; margin-bottom: 4px;">
                        YADAWY
                    </div>
                    <div style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 15px; font-style: italic; color: #E5C583; letter-spacing: 2px; margin-bottom: 18px;">
                        A Piece That Tells a Story • يدوى
                    </div>
                    <div style="display: inline-block; background: rgba(229, 197, 131, 0.16); border: 1px solid #C5A880; border-radius: 20px; padding: 7px 18px; font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 11.5px; font-weight: 700; letter-spacing: 1.5px; color: #FDFBF7; text-transform: uppercase;">
                        ${badgeTitle}
                    </div>
                    ${subtitle ? `<div style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 13.5px; color: #F3E8D6; margin-top: 12px; font-weight: 500;">${subtitle}</div>` : ''}
                </td>
            </tr>
        </table>
    `;
}

/**
 * Common Official Email Footer HTML
 */
function getEmailFooterHtml() {
    return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAF6F0; border-radius: 0 0 8px 8px; padding: 24px; border-top: 1px solid #E8DFD0; text-align: center;">
            <tr>
                <td align="center">
                    <p style="margin: 0 0 8px 0; font-family: 'Cinzel', Georgia, serif; font-size: 14px; font-weight: 700; color: #5B0E2D; letter-spacing: 2px;">
                        YADAWY LUXURY HANDWOVEN RUGS &amp; KILIM
                    </p>
                    <p style="margin: 0 0 12px 0; font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 11px; color: #78716C; line-height: 1.6;">
                        100% Authentic Egyptian Artisanal Craftsmanship • Insured Delivery Across Egypt
                    </p>
                    <div style="margin: 10px 0; font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 12px; color: #5B0E2D; font-weight: 600;">
                        <span>📞 +20 10 39555155</span> &nbsp;|&nbsp; <span>📞 +20 12 25910140</span>
                    </div>
                    <p style="margin: 14px 0 0 0; font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 10.5px; color: #A8A29E;">
                        © ${new Date().getFullYear()} Yadawy. All rights reserved. Sent to ${NOTIFICATION_EMAIL}.
                    </p>
                </td>
            </tr>
        </table>
    `;
}

/**
 * Build HTML for New Customer Order Notification
 */
function buildOrderEmailHtml(order) {
    const items = order.items || [];
    const formattedDate = formatDateTime(order.created_at || new Date());
    const subtotal = Number(order.subtotal || 0).toLocaleString();
    const discount = Number(order.discount_amount || order.discount || 0).toLocaleString();
    const total = Number(order.total || 0).toLocaleString();
    const paymentMethod = order.payment_method || 'Cash on Delivery (COD)';
    const orderStatus = order.status || 'Pending Fulfillment';

    const shippingAmount = Number(order.shipping_amount !== undefined && order.shipping_amount !== null ? order.shipping_amount : 100);
    const shippingDisplay = shippingAmount > 0 ? `${shippingAmount.toLocaleString()} LE` : 'FREE (Egypt Wide)';

    let itemsRows = '';
    for (const item of items) {
        const itemTotal = (Number(item.unit_price || 0) * Number(item.quantity || 1)).toLocaleString();
        const imgSrc = item._emailImageSrc || (item.product_image && !item.product_image.includes('localhost') && item.product_image.startsWith('http') ? item.product_image : `${BRAND_WEBSITE}/images/logo.png`);
        const productName = escapeHtml(item.product_name || 'Handmade Rug');
        const sizeText = item.size ? escapeHtml(item.size) : '';

        itemsRows += `
            <tr style="border-bottom: 1px solid #F0E8DC;">
                <td style="padding: 14px 10px; width: 68px; vertical-align: middle;">
                    <img src="${imgSrc}" alt="${productName}" width="60" height="60" style="width: 60px; height: 60px; min-width: 60px; max-width: 60px; object-fit: cover; border-radius: 6px; border: 1px solid #E5C583; display: block;" />
                </td>
                <td style="padding: 14px 10px; vertical-align: middle;">
                    <div style="font-family: 'Cinzel', Georgia, serif; font-size: 14px; font-weight: 700; color: #2D0814; margin-bottom: 3px;">
                        ${productName}
                    </div>
                    ${sizeText ? `<div style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 12px; color: #78716C; margin-bottom: 2px;">Size: <strong style="color:#5B0E2D;">${sizeText}</strong></div>` : ''}
                    <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 11.5px; color: #78716C;">
                        Quantity: <strong>${item.quantity || 1}</strong> × ${Number(item.unit_price || 0).toLocaleString()} LE
                    </div>
                </td>
                <td style="padding: 14px 10px; text-align: right; vertical-align: middle; font-family: 'Cinzel', Georgia, serif; font-size: 14px; font-weight: 700; color: #5B0E2D; white-space: nowrap;">
                    ${itemTotal} LE
                </td>
            </tr>
        `;
    }

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Order ${escapeHtml(order.order_number)}</title>
        </head>
        <body style="margin: 0; padding: 20px 0; background-color: #F6F3EE; font-family: 'Inter', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F6F3EE;">
                <tr>
                    <td align="center">
                        <table width="640" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; width: 100%; background-color: #FFFFFF; border-radius: 8px; box-shadow: 0 4px 20px rgba(91, 14, 45, 0.08); overflow: hidden; border: 1px solid #E8DFD0;">
                            
                            <!-- Header -->
                            <tr>
                                <td>
                                    ${getEmailHeaderHtml('✨ NEW CUSTOMER ORDER RECEIVED', `Order #${escapeHtml(order.order_number)}`)}
                                </td>
                            </tr>

                            <!-- Main Body -->
                            <tr>
                                <td style="padding: 28px 24px;">
                                    
                                    <!-- Status Alert Box -->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #FDFBF7; border: 1px solid #E5C583; border-left: 4px solid #5B0E2D; border-radius: 4px; padding: 14px 16px; margin-bottom: 24px;">
                                        <tr>
                                            <td>
                                                <div style="font-family: 'Cinzel', Georgia, serif; font-size: 14px; font-weight: 700; color: #5B0E2D; margin-bottom: 4px;">
                                                    New Order Notification
                                                </div>
                                                <div style="font-size: 12.5px; color: #57534E; line-height: 1.5;">
                                                    A customer has successfully placed an order on the Yadawy storefront. Please review the customer details and prepare fulfillment.
                                                </div>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Customer & Order Meta Grid -->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                                        <tr>
                                            <!-- Customer Info -->
                                            <td width="48%" style="vertical-align: top; background: #FAF7F2; padding: 16px; border-radius: 6px; border: 1px solid #EFE8DD;">
                                                <div style="font-family: 'Cinzel', Georgia, serif; font-size: 12px; font-weight: 700; color: #5B0E2D; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #E5DCCE; padding-bottom: 6px;">
                                                    👤 Customer Details
                                                </div>
                                                <div style="font-size: 13.5px; font-weight: 700; color: #1C1917; margin-bottom: 6px;">
                                                    ${escapeHtml(order.customer_name || 'Customer')}
                                                </div>
                                                <div style="font-size: 12px; color: #57534E; margin-bottom: 4px;">
                                                    📞 <strong>Phone:</strong> <a href="tel:${escapeHtml(order.customer_phone || '')}" style="color: #5B0E2D; text-decoration: none; font-weight: 600;">${escapeHtml(order.customer_phone || 'N/A')}</a>
                                                </div>
                                                <div style="font-size: 12px; color: #57534E; margin-bottom: 4px;">
                                                    ✉️ <strong>Email:</strong> <a href="mailto:${escapeHtml(order.customer_email || '')}" style="color: #5B0E2D; text-decoration: none; font-weight: 600;">${escapeHtml(order.customer_email || 'N/A')}</a>
                                                </div>
                                            </td>

                                            <td width="4%">&nbsp;</td>

                                            <!-- Delivery Details -->
                                            <td width="48%" style="vertical-align: top; background: #FAF7F2; padding: 16px; border-radius: 6px; border: 1px solid #EFE8DD;">
                                                <div style="font-family: 'Cinzel', Georgia, serif; font-size: 12px; font-weight: 700; color: #5B0E2D; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #E5DCCE; padding-bottom: 6px;">
                                                    📍 Delivery Address
                                                </div>
                                                <div style="font-size: 12.5px; color: #1C1917; line-height: 1.5; margin-bottom: 4px;">
                                                    <strong>Address:</strong> ${escapeHtml(order.address_line1 || 'N/A')}${order.address_line2 ? `, ${escapeHtml(order.address_line2)}` : ''}
                                                </div>
                                                <div style="font-size: 12px; color: #57534E; margin-bottom: 4px;">
                                                    <strong>City / State:</strong> ${escapeHtml(order.city || 'N/A')}${order.state ? `, ${escapeHtml(order.state)}` : ''}
                                                </div>
                                                <div style="font-size: 12px; color: #57534E;">
                                                    <strong>Country:</strong> ${escapeHtml(order.country || 'Egypt')}
                                                </div>
                                                ${order.notes ? `<div style="font-size: 11.5px; color: #854D0E; background:#FEF9C3; padding:6px 8px; border-radius:4px; margin-top:8px;"><strong>Note:</strong> ${escapeHtml(order.notes)}</div>` : ''}
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Order Overview Details Bar -->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #5B0E2D; color: #FFFFFF; border-radius: 6px; padding: 14px 16px; margin-bottom: 24px;">
                                        <tr>
                                            <td width="33%" style="text-align: left; font-size: 11.5px;">
                                                <div style="color: #E5C583; font-size: 10px; letter-spacing: 1px; text-transform: uppercase;">Order Number</div>
                                                <div style="font-family: 'Cinzel', Georgia, serif; font-weight: 700; font-size: 13px; margin-top: 2px;">${escapeHtml(order.order_number)}</div>
                                            </td>
                                            <td width="33%" style="text-align: center; font-size: 11.5px;">
                                                <div style="color: #E5C583; font-size: 10px; letter-spacing: 1px; text-transform: uppercase;">Date &amp; Time</div>
                                                <div style="font-size: 12px; margin-top: 2px;">${formattedDate}</div>
                                            </td>
                                            <td width="33%" style="text-align: right; font-size: 11.5px;">
                                                <div style="color: #E5C583; font-size: 10px; letter-spacing: 1px; text-transform: uppercase;">Payment / Status</div>
                                                <div style="font-weight: 700; font-size: 12px; margin-top: 2px; color:#A7F3D0;">${escapeHtml(paymentMethod)} • ${escapeHtml(orderStatus)}</div>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Purchased Items Table -->
                                    <div style="font-family: 'Cinzel', Georgia, serif; font-size: 14px; font-weight: 700; color: #5B0E2D; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px;">
                                        🛍️ Products Ordered (${items.length})
                                    </div>
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin-bottom: 24px;">
                                        <thead>
                                            <tr style="background: #FAF6F0; border-bottom: 2px solid #E5C583;">
                                                <th style="padding: 10px; text-align: left; font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 11px; color: #5B0E2D; text-transform: uppercase; letter-spacing: 1px;" colspan="2">Product</th>
                                                <th style="padding: 10px; text-align: right; font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 11px; color: #5B0E2D; text-transform: uppercase; letter-spacing: 1px;">Item Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${itemsRows}
                                        </tbody>
                                    </table>

                                    <!-- Price Breakdown Card -->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #FAF7F2; border: 1px solid #EAE0D2; border-radius: 6px; padding: 16px; margin-bottom: 28px;">
                                        <tr>
                                            <td style="font-size: 13px; color: #57534E; padding: 4px 0;">Subtotal:</td>
                                            <td style="font-size: 13px; color: #1C1917; font-weight: 600; text-align: right; padding: 4px 0;">${subtotal} LE</td>
                                        </tr>
                                        ${order.discount_amount > 0 ? `
                                            <tr>
                                                <td style="font-size: 13px; color: #166534; padding: 4px 0;">Coupon Discount ${order.coupon_code ? `(${escapeHtml(order.coupon_code)})` : ''}:</td>
                                                <td style="font-size: 13px; color: #166534; font-weight: 600; text-align: right; padding: 4px 0;">-${discount} LE</td>
                                            </tr>
                                        ` : ''}
                                        <tr>
                                            <td style="font-size: 13px; color: #57534E; padding: 4px 0;">Shipping &amp; Delivery Cost:</td>
                                            <td style="font-size: 13px; color: ${shippingAmount > 0 ? '#5B0E2D' : '#166534'}; font-weight: 700; text-align: right; padding: 4px 0;">${shippingDisplay}</td>
                                        </tr>
                                        <tr style="border-top: 2px solid #5B0E2D;">
                                            <td style="font-family: 'Cinzel', Georgia, serif; font-size: 16px; font-weight: 700; color: #5B0E2D; padding-top: 12px;">Total Order Amount:</td>
                                            <td style="font-family: 'Cinzel', Georgia, serif; font-size: 18px; font-weight: 800; color: #5B0E2D; text-align: right; padding-top: 12px;">${total} LE</td>
                                        </tr>
                                    </table>

                                    <!-- Action Button -->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td align="center">
                                                <a href="${BRAND_WEBSITE}/admin/#/orders" style="display: inline-block; background-color: #5B0E2D; color: #FFFFFF; font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-decoration: none; padding: 14px 32px; border-radius: 4px; text-transform: uppercase; border: 1px solid #C5A880; box-shadow: 0 4px 12px rgba(91, 14, 45, 0.2);">
                                                    Open Order in Admin Dashboard →
                                                </a>
                                            </td>
                                        </tr>
                                    </table>

                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td>
                                    ${getEmailFooterHtml()}
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
}

/**
 * Build HTML for Customer Contact Form / Inquiry Notification
 */
function buildContactInquiryEmailHtml(inquiry) {
    const formattedDate = formatDateTime(inquiry.created_at || new Date());
    const subject = inquiry.subject || inquiry.inquiry_type || 'General Customer Inquiry';

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Customer Contact Inquiry</title>
        </head>
        <body style="margin: 0; padding: 20px 0; background-color: #F6F3EE; font-family: 'Inter', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F6F3EE;">
                <tr>
                    <td align="center">
                        <table width="640" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; width: 100%; background-color: #FFFFFF; border-radius: 8px; box-shadow: 0 4px 20px rgba(91, 14, 45, 0.08); overflow: hidden; border: 1px solid #E8DFD0;">
                            
                            <!-- Header -->
                            <tr>
                                <td>
                                    ${getEmailHeaderHtml('💬 NEW CUSTOMER INQUIRY', escapeHtml(subject))}
                                </td>
                            </tr>

                            <!-- Main Body -->
                            <tr>
                                <td style="padding: 28px 24px;">
                                    
                                    <!-- Alert Box -->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #FDFBF7; border: 1px solid #E5C583; border-left: 4px solid #5B0E2D; border-radius: 4px; padding: 14px 16px; margin-bottom: 24px;">
                                        <tr>
                                            <td>
                                                <div style="font-family: 'Cinzel', Georgia, serif; font-size: 14px; font-weight: 700; color: #5B0E2D; margin-bottom: 4px;">
                                                    New Website Lead Received
                                                </div>
                                                <div style="font-size: 12.5px; color: #57534E; line-height: 1.5;">
                                                    A customer has submitted a contact form message on Yadawy. Please review and respond at your earliest convenience.
                                                </div>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Customer Information Card -->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #FAF7F2; border: 1px solid #EAE0D2; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
                                        <tr>
                                            <td style="font-family: 'Cinzel', Georgia, serif; font-size: 13px; font-weight: 700; color: #5B0E2D; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 12px; border-bottom: 1px solid #E5DCCE;" colspan="2">
                                                👤 Customer Contact Information
                                            </td>
                                        </tr>
                                        <tr>
                                            <td width="35%" style="padding: 10px 0; font-size: 12.5px; color: #78716C; font-weight: 600;">Customer Name:</td>
                                            <td style="padding: 10px 0; font-family: 'Cinzel', Georgia, serif; font-size: 14px; color: #1C1917; font-weight: 700;">
                                                ${escapeHtml(inquiry.name || 'Website Visitor')}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td width="35%" style="padding: 10px 0; font-size: 12.5px; color: #78716C; font-weight: 600;">Phone Number:</td>
                                            <td style="padding: 10px 0; font-size: 13px; color: #5B0E2D; font-weight: 700;">
                                                ${inquiry.phone ? `<a href="tel:${escapeHtml(inquiry.phone)}" style="color: #5B0E2D; text-decoration: none;">📞 ${escapeHtml(inquiry.phone)}</a>` : '<span style="color:#A8A29E;">Not provided</span>'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td width="35%" style="padding: 10px 0; font-size: 12.5px; color: #78716C; font-weight: 600;">Email Address:</td>
                                            <td style="padding: 10px 0; font-size: 13px; color: #5B0E2D; font-weight: 600;">
                                                ${inquiry.email ? `<a href="mailto:${escapeHtml(inquiry.email)}" style="color: #5B0E2D; text-decoration: none;">✉️ ${escapeHtml(inquiry.email)}</a>` : '<span style="color:#A8A29E;">Not provided</span>'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td width="35%" style="padding: 10px 0; font-size: 12.5px; color: #78716C; font-weight: 600;">Inquiry Topic:</td>
                                            <td style="padding: 10px 0; font-size: 13px; color: #1C1917; font-weight: 600;">
                                                <span style="display:inline-block; background:#5B0E2D; color:#FFFFFF; padding:3px 10px; border-radius:12px; font-size:11px; letter-spacing:0.5px;">${escapeHtml(subject)}</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td width="35%" style="padding: 10px 0; font-size: 12.5px; color: #78716C; font-weight: 600;">Submission Date &amp; Time:</td>
                                            <td style="padding: 10px 0; font-size: 12.5px; color: #57534E;">
                                                ${formattedDate}
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Message Content Section -->
                                    <div style="font-family: 'Cinzel', Georgia, serif; font-size: 13px; font-weight: 700; color: #5B0E2D; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                                        ✉️ Customer Message:
                                    </div>
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #FFFFFF; border: 1px solid #E5DCCE; border-left: 4px solid #C5A880; border-radius: 6px; padding: 18px 20px; margin-bottom: 28px;">
                                        <tr>
                                            <td style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 13.5px; color: #292524; line-height: 1.7; white-space: pre-wrap;">
${escapeHtml(inquiry.message || 'No message text.')}
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Action Button -->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td align="center">
                                                <a href="${BRAND_WEBSITE}/admin/#/contact-leads" style="display: inline-block; background-color: #5B0E2D; color: #FFFFFF; font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-decoration: none; padding: 14px 32px; border-radius: 4px; text-transform: uppercase; border: 1px solid #C5A880; box-shadow: 0 4px 12px rgba(91, 14, 45, 0.2);">
                                                    View in Admin Dashboard →
                                                </a>
                                            </td>
                                        </tr>
                                    </table>

                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td>
                                    ${getEmailFooterHtml()}
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
}

/**
 * 1. Send New Order Notification Email
 */
async function sendNewOrderNotification(orderData) {
    try {
        const mailTransporter = getTransporter();
        const { attachments } = prepareOrderEmailAttachments(orderData);
        const html = buildOrderEmailHtml(orderData);
        const subject = `[Yadawy] ✨ New Order Received #${orderData.order_number} (${Number(orderData.total || 0).toLocaleString()} LE)`;

        const mailOptions = {
            from: process.env.SMTP_FROM || `"Yadawy Rugs" <orders@yadawy.com>`,
            to: NOTIFICATION_EMAIL,
            subject: subject,
            text: `New Order Received #${orderData.order_number}\nCustomer: ${orderData.customer_name}\nPhone: ${orderData.customer_phone}\nEmail: ${orderData.customer_email}\nTotal: ${orderData.total} LE\nView in dashboard: ${BRAND_WEBSITE}/admin/#/orders`,
            html: html,
            attachments: attachments
        };

        const info = await mailTransporter.sendMail(mailOptions);
        console.log(`[EmailService] Order notification sent for #${orderData.order_number}. Message ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('[EmailService Error] Failed to send order notification:', err);
        return { success: false, error: err.message };
    }
}

/**
 * 2. Send Customer Contact / Inquiry Notification Email
 */
async function sendContactInquiryNotification(inquiryData) {
    try {
        const mailTransporter = getTransporter();
        const html = buildContactInquiryEmailHtml(inquiryData);
        const subject = `[Yadawy] 💬 New Customer Inquiry: ${inquiryData.name || 'Website Lead'} - ${inquiryData.subject || inquiryData.inquiry_type || 'General'}`;

        const mailOptions = {
            from: process.env.SMTP_FROM || `"Yadawy Contact" <contact@yadawy.com>`,
            to: NOTIFICATION_EMAIL,
            subject: subject,
            text: `New Customer Inquiry:\nName: ${inquiryData.name}\nPhone: ${inquiryData.phone || 'N/A'}\nEmail: ${inquiryData.email || 'N/A'}\nTopic: ${inquiryData.subject || inquiryData.inquiry_type || 'General'}\nMessage:\n${inquiryData.message}\nView in dashboard: ${BRAND_WEBSITE}/admin/#/contact-leads`,
            html: html
        };

        const info = await mailTransporter.sendMail(mailOptions);
        console.log(`[EmailService] Contact inquiry notification sent for "${inquiryData.name}". Message ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('[EmailService Error] Failed to send contact inquiry notification:', err);
        return { success: false, error: err.message };
    }
}

module.exports = {
    NOTIFICATION_EMAIL,
    sendNewOrderNotification,
    sendContactInquiryNotification,
    buildOrderEmailHtml,
    buildContactInquiryEmailHtml
};


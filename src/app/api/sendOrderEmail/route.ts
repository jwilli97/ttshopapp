import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function POST(request: Request) {
  try {
    const orderData = await request.json();

    // Format the order details into a readable email
    const formatAddress = (order: any) => {
      if (order.delivery_method === 'Pickup') {
        return `Pickup Location: ${order.street_address}`;
      }
      return `${order.street_address}, ${order.city}, ${order.state} ${order.zipcode}`;
    };

    const emailContent = `
      New Order Received!

      Customer Information:
      Name: ${orderData.display_name}
      Phone: ${orderData.phone_number}
      
      Order Details:
      Items: ${orderData.order_details.item}
      ${orderData.token_redemption ? `Token Redemption: ${orderData.token_redemption}\n` : ''}
      
      Delivery Information:
      Method: ${orderData.delivery_method}
      Address: ${formatAddress(orderData)}
      ${orderData.delivery_method === 'Pickup' ? `Pickup Time: ${orderData.pickup_time}` : ''}
      ${orderData.delivery_notes ? `Delivery Notes: ${orderData.delivery_notes}` : ''}
      
      Payment:
      Method: ${orderData.payment_method}
      ${orderData.cash_details ? `Cash Details: ${orderData.cash_details}` : ''}
      ${orderData.total ? `Total: $${orderData.total}` : 'Total: Pending Confirmation'}
    `;

    const msg = {
      to: 'support@tinytreesfarm.com',
      from: process.env.SENDGRID_FROM_EMAIL as string,
      subject: `New Order from ${orderData.display_name}`,
      text: emailContent,
    };

    await sgMail.send(msg);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send order notification email' },
      { status: 500 }
    );
  }
}
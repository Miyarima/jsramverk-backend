import sgMail from "@sendgrid/mail"; 


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function sendInviteEmail(recipient, documentId) {
    const msg = {
        to: recipient,
        from: "no-reply@yourapp.com", 
        subject: "You've been invited to collaborate on a document",
        text: `Click the following link to view the document: https://yourapp.com/documents/${documentId}`,
        html: `<strong>Click the following link to view the document: <a href="https://yourapp.com/documents/${documentId}">View Document</a></strong>`,
    };

    try {
        await sgMail.send(msg);
        console.log("Invite email sent successfully");
    } catch (error) {
        console.error("Error sending invite email", error);
    }
}
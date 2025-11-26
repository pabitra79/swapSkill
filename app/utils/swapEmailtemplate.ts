import dotenv from "dotenv";

dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

export interface SwapRequestEmailData {
    recipientName: string;
    senderName: string;
    skillToTeach: string;
    skillToLearn: string;
    message: string;
    requestId: string;
}

export interface SwapRequestAcceptedData {
    senderName: string;
    recipientName: string;
    skillToTeach: string;
    skillToLearn: string;
}

export interface SwapRequestDeclinedData {
    senderName: string;
    recipientName: string;
}

export const swapRequestEmailTemplate = (data: SwapRequestEmailData): string => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Swap Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                            <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 800;">
                                🤝 SkillSwap
                            </h1>
                            <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.95); font-size: 18px;">
                                New Swap Request Received!
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">
                                Hi ${data.recipientName}! 👋
                            </h2>
                            
                            <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                Great news! <strong>${data.senderName}</strong> wants to swap skills with you.
                            </p>
                            
                            <!-- Swap Details Card -->
                            <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 15px; padding: 25px; margin: 25px 0; border-left: 5px solid #667eea;">
                                <div style="margin-bottom: 20px;">
                                    <div style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 8px;">
                                        <span style="font-size: 16px;">📚</span> They want to learn
                                    </div>
                                    <p style="margin: 8px 0; color: #1f2937; font-size: 18px; font-weight: 700;">
                                        ${data.skillToTeach}
                                    </p>
                                </div>
                                
                                <div style="text-align: center; margin: 15px 0;">
                                    <span style="color: #667eea; font-size: 24px; font-weight: bold;">⇄</span>
                                </div>
                                
                                <div>
                                    <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 8px;">
                                        <span style="font-size: 16px;">🎓</span> They will teach
                                    </div>
                                    <p style="margin: 8px 0; color: #1f2937; font-size: 18px; font-weight: 700;">
                                        ${data.skillToLearn}
                                    </p>
                                </div>
                            </div>
                            
                            <!-- Personal Message -->
                            <div style="background: #fff7ed; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 10px; margin: 25px 0;">
                                <p style="margin: 0 0 10px 0; color: #92400e; font-weight: 600; font-size: 14px;">
                                    💬 Personal Message:
                                </p>
                                <p style="margin: 0; color: #78350f; font-size: 15px; line-height: 1.6; font-style: italic;">
                                    "${data.message}"
                                </p>
                            </div>
                            
                            <!-- Action Buttons -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <table cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td>
                                                    <a href="${BASE_URL}/requests/inbox" 
                                                       style="display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; text-decoration: none; padding: 15px 35px; border-radius: 50px; font-weight: 700; font-size: 16px; box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);">
                                                        View Request →
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 25px 0 0 0; color: #6b7280; font-size: 14px; text-align: center; line-height: 1.6;">
                                🚀 Ready to start learning? Log in to accept or decline this request.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #f9fafb; padding: 25px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px;">
                                Best regards,<br>
                                <strong style="color: #667eea;">The SkillSwap Team</strong>
                            </p>
                            <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                                © 2024 SkillSwap. Empowering knowledge exchange, one skill at a time.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};

export const swapRequestAcceptedTemplate = (data: SwapRequestAcceptedData): string => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Request Accepted!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px; text-align: center;">
                            <div style="font-size: 60px; margin-bottom: 10px;">🎉</div>
                            <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 800;">
                                Request Accepted!
                            </h1>
                            <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.95); font-size: 18px;">
                                Your swap partner is ready!
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">
                                Awesome news, ${data.senderName}! 🚀
                            </h2>
                            
                            <p style="margin: 0 0 25px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                <strong>${data.recipientName}</strong> has accepted your swap request!
                            </p>
                            
                            <!-- Success Badge -->
                            <div style="background: linear-gradient(135deg, #d1fae5, #a7f3d0); border-radius: 15px; padding: 25px; margin: 25px 0; text-align: center; border: 2px solid #10b981;">
                                <p style="margin: 0; color: #065f46; font-size: 18px; font-weight: 700;">
                                    ✅ You're now connected!
                                </p>
                                <p style="margin: 10px 0 0 0; color: #047857; font-size: 14px;">
                                    Start chatting and schedule your first session
                                </p>
                            </div>
                            
                            <!-- Swap Summary -->
                            <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 25px 0;">
                                <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px; font-weight: 600;">
                                    📋 SWAP DETAILS:
                                </p>
                                <p style="margin: 8px 0; color: #1f2937; font-size: 15px;">
                                    <span style="color: #10b981; font-weight: 600;">You'll teach:</span> ${data.skillToTeach}
                                </p>
                                <p style="margin: 8px 0; color: #1f2937; font-size: 15px;">
                                    <span style="color: #3b82f6; font-weight: 600;">You'll learn:</span> ${data.skillToLearn}
                                </p>
                            </div>
                            
                            <!-- Action Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${BASE_URL}/chat" 
                                           style="display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; text-decoration: none; padding: 15px 35px; border-radius: 50px; font-weight: 700; font-size: 16px; box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);">
                                            💬 Start Chatting
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 25px 0 0 0; color: #6b7280; font-size: 14px; text-align: center; line-height: 1.6;">
                                💡 <strong>Pro Tip:</strong> Schedule your first session within the next few days to keep the momentum going!
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #f9fafb; padding: 25px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px;">
                                Happy learning & teaching!<br>
                                <strong style="color: #10b981;">The SkillSwap Team</strong>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};

export const swapRequestDeclinedTemplate = (data: SwapRequestDeclinedData): string => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Request Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f3f4f6; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #6b7280, #4b5563); padding: 40px; text-align: center;">
                            <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">
                                SkillSwap Update
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 22px;">
                                Hi ${data.senderName},
                            </h2>
                            
                            <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                We wanted to let you know that <strong>${data.recipientName}</strong> has declined your swap request at this time.
                            </p>
                            
                            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0;">
                                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                                    <strong>💡 Don't be discouraged!</strong> There are many other amazing learners on SkillSwap waiting to connect with you.
                                </p>
                            </div>
                            
                            <!-- Action Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${BASE_URL}/browse" 
                                           style="display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; text-decoration: none; padding: 15px 35px; border-radius: 50px; font-weight: 700; font-size: 16px; box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);">
                                            🔍 Find New Partners
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 25px 0 0 0; color: #6b7280; font-size: 14px; text-align: center; line-height: 1.6;">
                                Keep exploring and you'll find the perfect match!
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #f9fafb; padding: 25px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #6b7280; font-size: 13px;">
                                Keep learning,<br>
                                <strong style="color: #667eea;">The SkillSwap Team</strong>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};
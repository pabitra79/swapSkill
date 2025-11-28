import { swapRequestRepository } from '../repository/swapRequest.repository';
import { userRepository } from '../repository/user.repository';
import { ISwapRequest } from '../interfaces/IswapRequest.interface';
import { sendEmail } from '../utils/emailTemplates.utils';
import { 
    swapRequestEmailTemplate, 
    swapRequestAcceptedTemplate, 
    swapRequestDeclinedTemplate 
} from '../utils/swapEmailtemplate'; 

export class SwapRequestService {

    async sendRequest(
        fromUserId: string,
        data: {
            toUserId: string;
            skillToTeach: string;
            skillToLearn: string;
            message: string;
        }
    ): Promise<{ success: boolean; message: string; request?: ISwapRequest }> {

        try {
            console.log(' Service sendRequest START');
            console.log('From User:', fromUserId);
            console.log('To User:', data.toUserId);
            console.log(' Skills:', { teach: data.skillToTeach, learn: data.skillToLearn });

            if (fromUserId === data.toUserId) {
                console.log(' Validation failed: Cannot send to self');
                return { success: false, message: "You cannot send a request to yourself" };
            }

            // Check if recipient exists
            console.log(' Checking if recipient exists...');
            const recipient = await userRepository.findUserById(data.toUserId);
            if (!recipient) {
                console.log(' Recipient not found');
                return { success: false, message: "User not found" };
            }
            console.log(' Recipient found:', recipient.name);

            // Check if sender exists
            console.log(' Checking if sender exists...');
            const sender = await userRepository.findUserById(fromUserId);
            if (!sender) {
                console.log(' Sender not found');
                return { success: false, message: "Sender not found" };
            }
            console.log('Sender found:', sender.name);

            // Check for existing requests
            console.log(' Checking for existing requests...');
            const existingRequest = await swapRequestRepository.findExisting(fromUserId, data.toUserId);
            if (existingRequest) {
                console.log(' Existing request found:', existingRequest.status);
                return { 
                    success: false, 
                    message: `You already have a ${existingRequest.status} request with this user`
                };
            }
            console.log(' No existing requests');

            // Validate sender can teach the skill they're offering
            console.log(' Validating sender skills...');
            console.log(' Sender teaches:', sender.profile?.teachSkills);
            console.log(' Offering to teach:', data.skillToTeach);
            
            if (!sender.profile?.teachSkills?.includes(data.skillToTeach)) {
                console.log(' Sender does not teach this skill');
                return { success: false, message: "You do not teach this skill" };
            }
            console.log(' Sender can teach this skill');

            // Validate recipient can teach the skill the sender wants to learn
            console.log(' Validating recipient skills...');
            console.log(' Recipient teaches:', recipient.profile?.teachSkills);
            console.log(' Want to learn:', data.skillToLearn);
            
            if (!recipient.profile?.teachSkills?.includes(data.skillToLearn)) {
                console.log(' Recipient does not teach the requested skill');
                return { success: false, message: "This user does not teach the skill you want to learn" };
            }
            console.log(' Recipient can teach this skill');

            // Create the swap request
            console.log(' Creating swap request...');
            const requestData = {
                fromUser: fromUserId as any,
                toUser: data.toUserId as any,
                skillToTeach: data.skillToTeach,
                skillToLearn: data.skillToLearn,
                message: data.message,
                status: "pending" as const
            };
            console.log(' Request data:', requestData);

            const request = await swapRequestRepository.create(requestData);
            console.log(' Request created with ID:', request._id);

            // Send email notification
            try {
                console.log(' Sending email notification...');
                const html = swapRequestEmailTemplate({
                    recipientName: recipient.name,
                    senderName: sender.name,
                    skillToTeach: data.skillToLearn,
                    skillToLearn: data.skillToTeach,
                    message: data.message,
                    requestId: request._id.toString(),
                });

                await sendEmail({
                    to: recipient.email,
                    subject: ` New Swap Request from ${sender.name}`,
                    html,
                });
                console.log(' Email sent successfully');
            } catch (emailError) {
                console.error(" Email notification failed:", emailError);
            }

            console.log(' Service sendRequest SUCCESS');
            return { 
                success: true, 
                message: "Swap request sent successfully!", 
                request 
            };

        } catch (error: any) {
            console.error(" Service sendRequest ERROR:", error);
            console.error(" Error stack:", error.stack);
            return { 
                success: false, 
                message: error.message || "Failed to send swap request" 
            };
        }
    }

    // Accept request
    async acceptRequest(requestId: string, userId: string): Promise<{ success: boolean; message: string }> {
        try {
            console.log(' Service acceptRequest - Request:', requestId, 'User:', userId);
            const request = await swapRequestRepository.findPendingByIdAndRecipient(requestId, userId);
            if (!request) {
                console.log(' Request not found or already processed');
                return { success: false, message: "Request not found or already processed" };
            }

            const updatedRequest = await swapRequestRepository.updateStatus(requestId, "accepted");
            if (!updatedRequest) {
                console.log(' Failed to update status');
                return { success: false, message: "Failed to accept request" };
            }

            try {
                const sender = await userRepository.findUserById(request.fromUser.toString());
                const recipient = await userRepository.findUserById(userId);

                if (sender && recipient) {
                    const html = swapRequestAcceptedTemplate({
                        senderName: sender.name,
                        recipientName: recipient.name,
                        skillToTeach: request.skillToLearn,
                        skillToLearn: request.skillToTeach,
                    });

                    await sendEmail({
                        to: sender.email,
                        subject: ` ${recipient.name} Accepted Your Swap Request!`,
                        html,
                    });
                }
            } catch (emailError) {
                console.error("Acceptance email failed:", emailError);
            }

            console.log(' Request accepted successfully');
            return { success: true, message: "Swap request accepted successfully" };

        } catch (error: any) {
            console.error("Accept request error:", error);
            return { success: false, message: error.message || "Failed to accept request" };
        }
    }

    // Decline request
    async declineRequest(requestId: string, userId: string): Promise<{ success: boolean; message: string }> {
        try {
            console.log(' Service declineRequest - Request:', requestId, 'User:', userId);
            const request = await swapRequestRepository.findPendingByIdAndRecipient(requestId, userId);
            if (!request) {
                return { success: false, message: "Request not found or already processed" };
            }

            const updatedRequest = await swapRequestRepository.updateStatus(requestId, "declined");
            if (!updatedRequest) {
                return { success: false, message: "Failed to decline request" };
            }

            // Send decline email
            try {
                const sender = await userRepository.findUserById(request.fromUser.toString());
                const recipient = await userRepository.findUserById(userId);

                if (sender && recipient) {
                    const html = swapRequestDeclinedTemplate({
                        senderName: sender.name,
                        recipientName: recipient.name,
                    });

                    await sendEmail({
                        to: sender.email,
                        subject: `Update on Your Swap Request`,
                        html,
                    });
                }
            } catch (emailError) {
                console.error("Decline email failed:", emailError);
            }

            return { success: true, message: "Swap request declined" };

        } catch (error: any) {
            console.error("Decline request error:", error);
            return { success: false, message: error.message || "Failed to decline request" };
        }
    }

    // Cancel request (by sender)
    async cancelRequest(requestId: string, userId: string): Promise<{ success: boolean; message: string }> {
        try {
            console.log(' Service cancelRequest - Request:', requestId, 'User:', userId);
            const request = await swapRequestRepository.findPendingByIdAndSender(requestId, userId);
            if (!request) {
                return { success: false, message: "Request not found or cannot be cancelled" };
            }

            const updatedRequest = await swapRequestRepository.updateStatus(requestId, "cancelled");
            if (!updatedRequest) {
                return { success: false, message: "Failed to cancel request" };
            }

            return { success: true, message: "Swap request cancelled" };

        } catch (error: any) {
            console.error("Cancel request error:", error);
            return { success: false, message: error.message || "Failed to cancel request" };
        }
    }

    async getInbox(userId: string, status?: string): Promise<ISwapRequest[]> {
        console.log(' Service getInbox - User ID:', userId, 'Status:', status);
        const requests = await swapRequestRepository.getInbox(userId, status);
        console.log(' Service getInbox - Found:', requests.length, 'requests');
        return requests;
    }


    async getOutbox(userId: string, status?: string): Promise<ISwapRequest[]> {
        console.log(' Service getOutbox - User ID:', userId, 'Status:', status);
        const requests = await swapRequestRepository.getOutbox(userId, status);
        console.log(' Service getOutbox - Found:', requests.length, 'requests');
        return requests;
    }

    async getPendingCount(userId: string): Promise<number> {
        return await swapRequestRepository.countPending(userId);
    }


    async checkConnectionStatus(
        user1Id: string, 
        user2Id: string
    ): Promise<{ 
        connected: boolean; 
        status?: string; 
        request?: ISwapRequest 
    }> {
        const requests = await swapRequestRepository.getRequestsBetweenUsers(user1Id, user2Id);

        const activeRequest = requests.find(request => 
            request.status === "pending" || request.status === "accepted"
        );

        if (activeRequest) {
            return { 
                connected: activeRequest.status === "accepted", 
                status: activeRequest.status, 
                request: activeRequest 
            };
        }

        return { connected: false };
    }

    async getRequestById(requestId: string): Promise<ISwapRequest | null> {
        return await swapRequestRepository.findById(requestId);
    }
}

export const swapRequestService = new SwapRequestService();
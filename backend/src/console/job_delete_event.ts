import { Op } from "sequelize";
import { Attendance } from "../repo/attendance";
import { Event } from "../repo/event";
import { EmailTemplate } from "../repo/emailTemplate";
import { EventRegistration } from "../repo/eventRegistration";
import { EventRegistrationFormSession } from "../repo/eventRegistrationFormSession";
import { EventSession } from "../repo/eventSession";
import { Participant } from "../repo/participant";
import { ParticipantSession } from "../repo/participantSession";
import { RoleUser } from "../repo/roleUser";
import { FileCollection } from "../repo/fileCollection";
import { FileSubmission } from "../repo/fileSubmission";
import { Web } from "../repo/web";
import { WebMenu } from "../repo/webMenu";
import { WebPage } from "../repo/webPage";

import { EventAlbums } from "../repo/eventAlbums";
import { EventPhotos } from "../repo/eventPhotos";
import { EventFolders } from "../repo/eventFiles";
import { EventFiles } from "../repo/eventFiles";

import * as s3 from "../utilities/s3client";
import * as config from '../utilities/config';
import '../repo';

class ApiError implements Error {
    constructor(message: string) {
        this.name = "ApiError";
        this.message = message;
    }
    name: string;
    message: string;
    stack?: string;
}

export default async function main(eventId: string) {
    if (!eventId) { throw new ApiError("Invalid eventId"); }

    const event = await Event.findByPk(eventId)
    if (!event) { throw new ApiError(`Event not found!`); }
    console.log("Found Event:", event?.get())

    console.log("Delete Attendance - Begin")
    await Attendance.destroy({ where: { eventId } })
    console.log("Delete Attendance - End")

    console.log("Delete EmailTemplate - Begin")
    await EmailTemplate.destroy({ where: { eventId } })
    console.log("Delete EmailTemplate - End")

    console.log("Delete EventRegistration - Begin")
    await EventRegistration.destroy({ where: { eventId } })
    console.log("Delete EventRegistration - End")

    console.log("Delete EventRegistrationFormSession - Begin")
    await EventRegistrationFormSession.destroy({ where: { eventId } })
    console.log("Delete EventRegistrationFormSession - End")

    console.log("Delete EventSession - Begin")
    await EventSession.destroy({ where: { eventId } })
    console.log("Delete EventSession - End")

    console.log("Delete Participant - Begin")
    await Participant.destroy({ where: { eventId } })
    console.log("Delete Participant - End")

    console.log("Delete ParticipantSession - Begin")
    await ParticipantSession.destroy({ where: { eventId } })
    console.log("Delete ParticipantSession - End")

    console.log("Delete RoleUser - Begin")
    await RoleUser.destroy({ where: { eventId } })
    console.log("Delete RoleUser - End")

    console.log("Delete FileSubmission - Begin")
    const collectionId = await FileCollection.findOne({where: {eventId}});
    if(collectionId){
        console.log("Delete FileSubmissio in s3 - Begin")
        await FileSubmission.destroy({ where: { collectionId: collectionId?.id } });
        await s3.deleteObject(eventId);
        console.log("Delete FileSubmission in s3- End")
    }
    console.log("Delete FileSubmission - End")

    console.log("Delete FileCollection - Begin")
    await FileCollection.destroy({ where: { eventId } })
    console.log("Delete FileCollection - End")

    console.log("Delete Web - Begin")
    const web = await Web.findOne({where: {eventId}});
    if(web){
        await WebMenu.destroy({ where: { webId: web?.id} });
        await WebPage.destroy({ where: { webId: web?.id} });
        await web.destroy();
    }
    console.log("Delete Web - End")

    console.log("Delete Photo gallery - Begin")
    await s3.deleteObject(`${config.S3CLIENT_GALLERY_FOLDER}/${eventId}`);
    const album = await EventAlbums.findOne({where: { eventId }});
    if(album){
        console.log("Delete Photo gallery in s3 - Begin")
        await EventPhotos.destroy({ where: { albumId: album?.id } });
        await album.destroy();
        console.log("Delete Photo gallery in s3- End")
    }
    console.log("Delete Photo gallery - End")

    console.log("Delete Event Document - Begin")
    await s3.deleteObject(`${config.S3CLIENT_DOCUMENT_FOLDER}/${eventId}`);
    const folder = await EventFolders.findOne({where: { eventId }});
    if(folder){
        console.log("Delete Event Document in s3 - Begin")
        await EventFiles.destroy({ where: { folderId: folder?.id } });
        await folder.destroy(); 
        console.log("Delete Event Document in s3- End")
    }
    console.log("Delete Event Document - End")

    console.log("Delete Event - Begin")
    await Event.destroy({ where: { id: eventId } })
    console.log("Delete Event - End")
}
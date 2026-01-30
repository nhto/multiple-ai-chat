import {
  Abstracts,
  AbstractReviewers,
  AbstractReviewConfigs,
  AbstractSubmitters,
  AbstractReviews,
  AbstractTopics,
  AbstractReviewDeciders,
  AbstractReviewEmailTemplates,
  AbstractReviewEmailDeliveryLog,
  AbstractSubmissionFormCustomQuestionReplies,
  AbstractSubmissionFormCustomQuestions,
  AbstractSubmissionPresentationModeOptions
} from "../../repo/eventAbstractReviews";
import { Event } from "../../repo/event";
import { Op, Sequelize } from "sequelize";
import {
  AvailableAbstractsDetails,
  PickedAbstractDetails,
  AbstractReviewsAttributes,
  BulkSelectedAbstractReviews,
  AssessmentRecords,
  AbstractReviewInput,
  ReviewCheckResult,
  EmailDeliveryLogInput,
  EmailDeliveryLogInputNew,
} from "./interfaces";
import {
  formatDateV2,
  generateEmailDeliveryLogData,
  getMailOptions,
  generateReviewerReviewEndContent,
} from "../../utilities/payload";
import { sendEmail } from "../../utilities/email";
import { getAbstractFileUrl } from "../../utilities/payload";
export const JOIN_SYMBOL = ":::";

export async function getReviewerIdByEmail(
  email: string,
  eventId: string
): Promise<number | null> {
  try {
    const reviewer = await AbstractReviewers.findOne({
      where: {
        eventId,
        email,
      },
      attributes: ["id"], // Only select the 'id' field
    });

    if (reviewer) {
      return reviewer.id;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching reviewer by email: ", error);
    return null;
  }
}

export async function getTopicIdByReviewerId(
  reviewerId: number
): Promise<number | null> {
  try {
    const reviewer = await AbstractReviewers.findOne({
      where: { id: reviewerId },
      attributes: ["topicId"], // Only select the 'topicId' field
    });

    if (reviewer && reviewer.topicId) {
      return reviewer.topicId;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching topic ID by reviewer ID: ", error);
    return null;
  }
}

export async function getTopicByTopicId(
  topicId: number
): Promise<string | null> {
  try {
    const topicRowData = await AbstractTopics.findByPk(topicId, {
      attributes: ["topic"],
    });

    if (!topicRowData) {
      console.log("Topic not found");
      return null;
    }

    return topicRowData.topic;
  } catch (error) {
    console.error("Error fetching topic by topicId:", error);
    throw new Error("Failed to retrieve topic");
  }
}

/**
 * Use Case:
 * (1) Landing Page Counts
 * (2) Available Abstract Page
 */
export async function getAvailableAbstractsDetails(
  eventId: string,
  reviewerId: number,
  topicId: number
): Promise<any> {
  // Fetch the abstract configuration
  const abstractConfig = await AbstractReviewConfigs.findOne({
    where: { eventId },
    attributes: [
      "id",
      "eventId",
      "reviewerPerAbstract",
      "gradingMethod",
      "abstractSubmissionEndDate",
      "allowSameInstitution",
      "createdAt",
      "updatedAt",
    ],
  });

  if (!abstractConfig) {
    throw new Error("AbstractConfig not found");
  }

  // Fetch the reviewer's institution if necessary
  let reviewerInstitution = null;
  if (!abstractConfig.allowSameInstitution) {
    const reviewer = await AbstractReviewers.findOne({
      where: { id: reviewerId },
      attributes: ["institution"],
    });
    if (!reviewer) {
      throw new Error("Reviewer not found");
    }
    reviewerInstitution = reviewer.institution;
  }

  // Define the where clause for submitters based on institution restriction
  const submitterWhereClause: any = {};
  if (!abstractConfig.allowSameInstitution && reviewerInstitution) {
    submitterWhereClause.institution = { [Op.ne]: reviewerInstitution };
  }

  // Retrieve all Abstracts with the specified conditions
  const abstracts = await Abstracts.findAll({
    include: [
      {
        model: AbstractSubmitters,
        required: true,
        where: submitterWhereClause,
        attributes: [
          "id",
          "eventId",
          "title",
          "firstName",
          "lastName",
          "email",
          "createdAt",
          "updatedAt",
          "institution",
        ],
      },
    ],
    where: {
      eventId,
      topicId,
      isSubmitted: true,
      isReviewerNotified: true,
      id: {
        [Op.notIn]: Sequelize.literal(
          `(SELECT abstractId FROM AbstractReviews WHERE reviewerId = ${reviewerId})`
        ),
      },
    },
    attributes: [
      "id",
      "title",
      "description",
      "submitterId",
      "topicId",
      "reviewerNumber",
      "isReviewed",
      "isReviewFinalized",
      "isReviewerNotified",
      "isChairmanNotified",
      "isSubmitterNotified",
      "createdAt",
      "updatedAt",
      "selectedPresentationMode"
    ],
    order: [["createdAt", "DESC"]],
  });

  // Filter abstracts based on the number of reviewers allowed per abstract
  const filteredAbstracts = abstracts.filter(
    (abstract) => abstract.reviewerNumber < abstractConfig.reviewerPerAbstract
  );

  await Promise.all(filteredAbstracts.map(async abstract => {
    const submitter = await AbstractSubmitters.findOne({
      where: { id: abstract.submitterId },
    });
    abstract.setDataValue('submitterTitle', submitter?.title);
    abstract.setDataValue('email', submitter?.email);
    abstract.setDataValue('firstName', submitter?.firstName);
    abstract.setDataValue('lastName', submitter?.lastName);
    abstract.setDataValue('institution', submitter?.institution);
    abstract.setDataValue('department', submitter?.department);
    abstract.setDataValue('position', submitter?.position);
    abstract.setDataValue('country', submitter?.country);
    abstract.setDataValue('mobilePhone', submitter?.mobilePhone);
    abstract.setDataValue('officePhone', submitter?.officePhone);

    const topic = await AbstractTopics.findOne({
      where: { id: abstract.topicId },
    });
    abstract.setDataValue('topic', topic?.topic);

    const presentationMode = await AbstractSubmissionPresentationModeOptions.findOne({ where: { mode: abstract.selectedPresentationMode } });

    if (presentationMode) {
      abstract.setDataValue('presentationMode', presentationMode.modeDisplayName);
    }

    // if (abstract.selectedPresentationMode === 'oral') {
    //   abstract.setDataValue('presentationMode', 'Oral Presentation');
    // }

    // else if (abstract.selectedPresentationMode === 'posterhardcopy') {
    //   abstract.setDataValue('presentationMode', 'Poster (Hard Copy)');
    // }

    // else if (abstract.selectedPresentationMode === 'posterecopy') {
    //   abstract.setDataValue('presentationMode', 'Poster (E-Copy)');
    // }

    // else if (abstract.selectedPresentationMode === 'anyone') {
    //   abstract.setDataValue('presentationMode', 'Anyone');
    // }

    if (abstract.fileName) {
      abstract.fileName = Buffer.from(abstract.fileName, 'latin1').toString('utf8');
    }

    const customQuestionReplyCollection = await AbstractSubmissionFormCustomQuestionReplies.findAll({
      where: {
        eventId: eventId,
        submitterId: abstract.submitterId
      },
      order: [['customQuestionId', 'ASC']]
    });

    for (const [index, customQuestionReply] of customQuestionReplyCollection.entries()) {
      if (index === 0) {
        abstract.setDataValue(`customQuestion0`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
      if (index === 1) {
        abstract.setDataValue(`customQuestion1`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
      if (index === 2) {
        abstract.setDataValue(`customQuestion2`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
      if (index === 3) {
        abstract.setDataValue(`customQuestion3`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
      if (index === 4) {
        abstract.setDataValue(`customQuestion4`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
      if (index === 5) {
        abstract.setDataValue(`customQuestion5`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
      if (index === 6) {
        abstract.setDataValue(`customQuestion6`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
      if (index === 7) {
        abstract.setDataValue(`customQuestion7`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
      if (index === 8) {
        abstract.setDataValue(`customQuestion8`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
      if (index === 9) {
        abstract.setDataValue(`customQuestion9`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
    }
  }));

  const customQuestionCollection = await AbstractSubmissionFormCustomQuestions.findAll({
    where: {
      eventId: eventId
    },
    order: [['id', 'ASC']]
  });

  // Map the filtered results to include configuration and submitter details explicitly
  return {
    abstractCollection: filteredAbstracts.map((abstract) => ({
      ...abstract.toJSON(),
      createdAt: formatDateV2(new Date(abstract.createdAt)),
      updatedAt: formatDateV2(new Date(abstract.updatedAt)),
      AbstractReviewConfig: {
        id: abstractConfig.id,
        eventId: abstractConfig.eventId,
        reviewerPerAbstract: abstractConfig.reviewerPerAbstract,
        gradingMethod: abstractConfig.gradingMethod,
        abstractSubmissionEndDate: abstractConfig.abstractSubmissionEndDate,
        allowSameInstitution: abstractConfig.allowSameInstitution,
        createdAt: abstractConfig.createdAt,
        updatedAt: abstractConfig.updatedAt,
      },
    })),
    customQuestionCollection: customQuestionCollection.map(item => item.question)
  }
}

/**
 * Use Case:
 * (1) Landing Page Counts
 * (2) Picked Abstracts Page
 */
export async function getPickedAbstracts(
  reviewerId: number,
  eventId: string
): Promise<any> {
  let results = (await Abstracts.findAll({
    include: [
      {
        model: AbstractReviews,
        required: true,
        where: {
          reviewerId,
          isDraft: null,
          comments: null,
          grades: null,
        },
        attributes: [
          "id",
          "abstractId",
          "reviewerId",
          "comments",
          "grades",
          "createdAt",
          "updatedAt",
        ],
      },
    ],
    where: {
      eventId,
      "$AbstractReviews.reviewerId$": reviewerId,
    },
    attributes: [
      "id",
      "title",
      "description",
      "eventId",
      "submitterId",
      "topicId",
      "reviewerNumber",
      "isReviewed",
      "isReviewFinalized",
      "isChairmanNotified",
      "isReviewerNotified",
      "isSubmitterNotified",
      "createdAt",
      "updatedAt",
      "selectedPresentationMode"
    ],
    order: [["createdAt", "DESC"]], // Optional: order by the date created if needed
  })) as any;


  await Promise.all(results.map(async (abstract: { submitterId: any; setDataValue: (arg0: string, arg1: string) => void; topicId: any; selectedPresentationMode: string; fileName: WithImplicitCoercion<string> | { [Symbol.toPrimitive](hint: "string"): string; }; }) => {
    const submitter = await AbstractSubmitters.findOne({
      where: { id: abstract.submitterId },
    });
    abstract.setDataValue('submitterTitle', submitter?.title);
    abstract.setDataValue('email', submitter?.email);
    abstract.setDataValue('firstName', submitter?.firstName);
    abstract.setDataValue('lastName', submitter?.lastName);
    abstract.setDataValue('institution', submitter?.institution);
    abstract.setDataValue('department', submitter?.department);
    abstract.setDataValue('position', submitter?.position);
    abstract.setDataValue('country', submitter?.country);
    abstract.setDataValue('mobilePhone', submitter?.mobilePhone);
    abstract.setDataValue('officePhone', submitter?.officePhone);

    const topic = await AbstractTopics.findOne({
      where: { id: abstract.topicId },
    });
    abstract.setDataValue('topic', topic?.topic);

    const presentationMode = await AbstractSubmissionPresentationModeOptions.findOne({ where: { mode: abstract.selectedPresentationMode } });

    if (presentationMode) {
      abstract.setDataValue('presentationMode', presentationMode.modeDisplayName);
    }


    // if (abstract.selectedPresentationMode === 'oral') {
    //   abstract.setDataValue('presentationMode', 'Oral Presentation');
    // }

    // else if (abstract.selectedPresentationMode === 'posterhardcopy') {
    //   abstract.setDataValue('presentationMode', 'Poster (Hard Copy)');
    // }

    // else if (abstract.selectedPresentationMode === 'posterecopy') {
    //   abstract.setDataValue('presentationMode', 'Poster (E-Copy)');
    // }

    // else if (abstract.selectedPresentationMode === 'anyone') {
    //   abstract.setDataValue('presentationMode', 'Anyone');
    // }

    if (abstract.fileName) {
      abstract.fileName = Buffer.from(abstract.fileName, 'latin1').toString('utf8');
    }

    const customQuestionReplyCollection = await AbstractSubmissionFormCustomQuestionReplies.findAll({
      where: {
        eventId: eventId,
        submitterId: abstract.submitterId
      },
      order: [['customQuestionId', 'ASC']]
    });

    for (const [index, customQuestionReply] of customQuestionReplyCollection.entries()) {
      if (index === 0) {
        abstract.setDataValue(`customQuestion0`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
      if (index === 1) {
        abstract.setDataValue(`customQuestion1`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
      if (index === 2) {
        abstract.setDataValue(`customQuestion2`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
      if (index === 3) {
        abstract.setDataValue(`customQuestion3`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
      if (index === 4) {
        abstract.setDataValue(`customQuestion4`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
      if (index === 5) {
        abstract.setDataValue(`customQuestion5`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
      if (index === 6) {
        abstract.setDataValue(`customQuestion6`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
      if (index === 7) {
        abstract.setDataValue(`customQuestion7`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
      if (index === 8) {
        abstract.setDataValue(`customQuestion8`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
      if (index === 9) {
        abstract.setDataValue(`customQuestion9`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
    }
  }));

  const customQuestionCollection = await AbstractSubmissionFormCustomQuestions.findAll({
    where: {
      eventId: eventId
    },
    order: [['id', 'ASC']]
  });

  return {
    abstractCollection: results.map((abstract: any) => ({
      ...abstract.get({ plain: true }),
      fileUrl: getAbstractFileUrl(eventId, abstract.id),
      createdAt: formatDateV2(new Date(abstract.createdAt)),
      updatedAt: formatDateV2(new Date(abstract.updatedAt)),
      AbstractReviews: abstract.AbstractReviews.map((review: any) => ({
        ...review.get({ plain: true }),
        createdAt: formatDateV2(new Date(review.createdAt)),
        updatedAt: formatDateV2(new Date(review.updatedAt)),
      })),
    })),
    customQuestionCollection: customQuestionCollection.map(item => item.question)
  }

}

/**
 * Use Case:
 * (1) Landing Page Counts
 * (2) Reviewed Abstracts Page
 */
export async function getReviewedAbstracts(
  reviewerId: number,
  eventId: string
): Promise<any> {
  let results = (await Abstracts.findAll({
    include: [
      {
        model: AbstractReviews,
        required: true,
        where: {
          [Op.or]: [
            {
              [Op.and]: [
                { comments: { [Op.ne]: null } },
                { grades: { [Op.ne]: null } },
              ],
            },
            { grades: { [Op.ne]: null } },
          ],
          reviewerId,
          isDraft: {
            [Op.or]: [0, 1], // Accepting both '0' and '1' for isDraft
          },
        },
        attributes: [
          "id",
          "abstractId",
          "reviewerId",
          "comments",
          "grades",
          "isDraft",
          "createdAt",
          "updatedAt",
        ],
      },
    ],
    where: {
      eventId,
      "$AbstractReviews.reviewerId$": reviewerId, // Ensuring the filtered reviews match the reviewer ID
    },
    attributes: [
      "id",
      "title",
      "description",
      "eventId",
      "submitterId",
      "topicId",
      "reviewerNumber",
      "isReviewed",
      "isChairmanNotified",
      "isReviewFinalized",
      "isChairmanNotified",
      "isReviewerNotified",
      "isSubmitterNotified",
      "createdAt",
      "updatedAt",
      "selectedPresentationMode"
    ],
    order: [["createdAt", "DESC"]], // Optional: order by the date created if needed
  })) as any;

  await Promise.all(results.map(async (abstract: { submitterId: any; setDataValue: (arg0: string, arg1: string) => void; topicId: any; selectedPresentationMode: string; fileName: WithImplicitCoercion<string> | { [Symbol.toPrimitive](hint: "string"): string; }; }) => {
    const topic = await AbstractTopics.findOne({
      where: { id: abstract.topicId },
    });
    abstract.setDataValue('topic', topic?.topic);

    const presentationMode = await AbstractSubmissionPresentationModeOptions.findOne({ where: { mode: abstract.selectedPresentationMode } });

    if (presentationMode) {
      abstract.setDataValue('presentationMode', presentationMode.modeDisplayName);
    }

    // if (abstract.selectedPresentationMode === 'oral') {
    //   abstract.setDataValue('presentationMode', 'Oral Presentation');
    // }

    // else if (abstract.selectedPresentationMode === 'posterhardcopy') {
    //   abstract.setDataValue('presentationMode', 'Poster (Hard Copy)');
    // }

    // else if (abstract.selectedPresentationMode === 'posterecopy') {
    //   abstract.setDataValue('presentationMode', 'Poster (E-Copy)');
    // }

    // else if (abstract.selectedPresentationMode === 'anyone') {
    //   abstract.setDataValue('presentationMode', 'Anyone');
    // }

    if (abstract.fileName) {
      abstract.fileName = Buffer.from(abstract.fileName, 'latin1').toString('utf8');
    }

    const customQuestionReplyCollection = await AbstractSubmissionFormCustomQuestionReplies.findAll({
      where: {
        eventId: eventId,
        submitterId: abstract.submitterId
      },
      order: [['customQuestionId', 'ASC']]
    });

    for (const [index, customQuestionReply] of customQuestionReplyCollection.entries()) {
      if (index === 0) {
        abstract.setDataValue(`customQuestion0`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
      if (index === 1) {
        abstract.setDataValue(`customQuestion1`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
      if (index === 2) {
        abstract.setDataValue(`customQuestion2`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
      if (index === 3) {
        abstract.setDataValue(`customQuestion3`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
      if (index === 4) {
        abstract.setDataValue(`customQuestion4`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
      if (index === 5) {
        abstract.setDataValue(`customQuestion5`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
      if (index === 6) {
        abstract.setDataValue(`customQuestion6`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
      if (index === 7) {
        abstract.setDataValue(`customQuestion7`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
      if (index === 8) {
        abstract.setDataValue(`customQuestion8`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
      if (index === 9) {
        abstract.setDataValue(`customQuestion9`, customQuestionReply.reply.replaceAll(JOIN_SYMBOL, ","));
      }
    }
  }));

  const customQuestionCollection = await AbstractSubmissionFormCustomQuestions.findAll({
    where: {
      eventId: eventId
    },
    order: [['id', 'ASC']]
  });

  return {
    abstractCollection: results.map((abstract: any) => ({
      ...abstract.get({ plain: true }),
      fileUrl: getAbstractFileUrl(eventId, abstract.id),
      createdAt: formatDateV2(new Date(abstract.createdAt)),
      updatedAt: formatDateV2(new Date(abstract.updatedAt)),
      AbstractReviews: abstract.AbstractReviews.map((review: any) => ({
        ...review.get({ plain: true }),
        createdAt: formatDateV2(new Date(review.createdAt)),
        updatedAt: formatDateV2(new Date(review.updatedAt)),
      })),
    })),
    customQuestionCollection: customQuestionCollection.map(item => item.question)
  }
}

export async function addAbstractReview(
  eventId: string,
  reviewerId: number,
  abstractId: number
): Promise<AbstractReviewsAttributes> {
  try {
    const [review, created] = await AbstractReviews.findOrCreate({
      where: { eventId, reviewerId, abstractId },
      defaults: {
        comments: null, // Assuming comments are optional and initially not provided
        grades: null, // Assuming grades are optional and initially not provided
        createdBy: "system", // Assume a system account or user context provides this
        updatedBy: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    if (created) {
      await increaseReviewerNumberForAbstract(abstractId, eventId);
    }

    if (!created) {
      console.log("Review already exists, returning existing record.");
    }

    return review.get({ plain: true }); // Returns plain object representation of the Sequelize model instance
  } catch (error) {
    console.error("Error adding abstract review:", error);
    throw error; // Re-throw the error for further handling (e.g., HTTP response in Express.js)
  }
}

export async function checkAbstractReviewsDuplicatesForBulkSelect(
  abstractReview: any
) {
  let count = await AbstractReviews.count({
    where: {
      eventId: abstractReview.eventId,
      reviewerId: abstractReview.reviewerId,
      abstractId: abstractReview.abstractId,
    },
  });
  return count;
}

export async function addMultipleAbstractReviews(
  reviewsData: BulkSelectedAbstractReviews[]
): Promise<AbstractReviewsAttributes[]> {
  try {
    const reviews = await AbstractReviews.bulkCreate(reviewsData, {
      fields: [
        "eventId",
        "reviewerId",
        "abstractId",
        "createdAt",
        "createdBy",
        "updatedAt",
        "updatedBy",
      ], // Specify fields allowed for insertion
      returning: true, // If supported by the DB, this will return the records after insertion
    });

    // Convert Sequelize model instances to plain data objects.
    const plainData = reviews.map((r) => r.get({ plain: true })) as any;
    return plainData;
  } catch (error) {
    console.error("Error in bulk creating abstract reviews:", error);
    throw error; // Propagate the error to be handled by the caller
  }
}

export async function increaseReviewerNumberForAbstract(
  abstractId: number,
  eventId: string
): Promise<any> {
  try {
    const abstract = await Abstracts.findOne({
      where: {
        id: abstractId,
        eventId,
      },
    });

    if (!abstract) {
      throw new Error("Abstract not found");
    }

    // Increment the reviewerNumber
    abstract.reviewerNumber += 1;

    // Save the updated abstract
    const updatedAbstract = await abstract.save();

    return updatedAbstract.get({ plain: true }) as any; // Ensuring type safety
  } catch (error) {
    console.error("Failed to increment reviewer number:", error);
    throw error;
  }
}

export async function increaseReviewerNumbersForMultipleAbstracts(
  abstractIds: number[],
  eventId: string
): Promise<any> {
  try {
    const result = await Abstracts.update(
      {
        reviewerNumber: Sequelize.literal("reviewerNumber + 1"), // Increment the current reviewerNumber by 1
      },
      {
        where: {
          id: {
            [Op.in]: abstractIds, // Apply the update to all abstracts whose IDs are in the provided array
          },
          eventId: eventId, // Ensure that the update is only applied to abstracts within the specific event
        },
      }
    );

    console.log(`Updated ${result[0]} abstract(s).`);
  } catch (error) {
    console.error("Error incrementing reviewer numbers:", error);
    throw error;
  }
}

export async function getGradingMethodByEventId(eventId: string): Promise<any> {
  try {
    const config = await AbstractReviewConfigs.findOne({
      where: { eventId },
      attributes: ["gradingMethod"],
    });

    return config;
  } catch (error) {
    console.error("Failed to fetch grading method:", error);
    throw error; // Optionally re-throw or handle the error differently
  }
}

export async function getCommentsAndGrades(
  eventId: string,
  abstractId: number,
  reviewerId: number
): Promise<AssessmentRecords> {
  try {
    const review = await AbstractReviews.findOne({
      where: {
        eventId: eventId,
        abstractId: abstractId,
        reviewerId: reviewerId,
      },
      attributes: ["comments", "grades"],
    });

    if (!review) {
      return { comments: null, grades: null }; // Handle case where no data is found
    }

    return {
      comments: review.comments,
      grades: review.grades,
    };
  } catch (error) {
    console.error("Failed to fetch review details:", error);
    throw error; // Optionally re-throw or handle the error differently
  }
}

export async function manageAbstractReview(
  data: AbstractReviewInput
): Promise<any> {
  const { abstractId, eventId, reviewerId, comments, grades, isSubmission } =
    data;

  try {
    const [instance, created] = await AbstractReviews.upsert(
      {
        abstractId,
        eventId,
        reviewerId,
        comments, // These could be updated if existing
        grades,
        isDraft: isSubmission ? 0 : 1,
      },
      {
        fields: ["comments", "grades", "isDraft"], // Fields that are allowed to be updated
        returning: true, // To get the updated or created instance back
      }
    );

    console.log(
      created ? "Created a new record." : "Updated an existing record."
    );
    return instance.get({ plain: true }); // Returning the plain data object
  } catch (error) {
    console.error("Error in upsert operation:", error);
    throw error; // Propagate the error to be handled by the caller
  }
}

export async function getAbstractReviewerNumber(
  eventId: string,
  abstractId: number
): Promise<number | null> {
  try {
    const abstract = await Abstracts.findOne({
      where: { eventId, id: abstractId },
      attributes: ["reviewerNumber"], // Only fetch the reviewerNumber
    });

    if (abstract) {
      return abstract.reviewerNumber; // Return the reviewer number if found
    } else {
      console.log("No Abstract Found");
      return null; // Return null if no abstract is found
    }
  } catch (error) {
    console.error("Error fetching reviewer number:", error);
    throw error; // Propagate the error to be handled by the caller
  }
}

export async function getConfigAbstractReviewerNumber(
  eventId: string
): Promise<number | null> {
  try {
    const abstractConfig = await AbstractReviewConfigs.findOne({
      where: { eventId },
      attributes: ["reviewerPerAbstract"], // Only fetch the reviewerNumber
    });

    if (abstractConfig) {
      return abstractConfig.reviewerPerAbstract; // Return the reviewer number if found
    } else {
      console.log("No Abstract Config Found");
      return null; // Return null if no abstract is found
    }
  } catch (error) {
    console.error("Error fetching reviewer number:", error);
    throw error; // Propagate the error to be handled by the caller
  }
}

export async function markAbstractAsReviewed(
  eventId: string,
  abstractId: number
): Promise<void> {
  try {
    const result = await Abstracts.update(
      {
        isReviewed: true, // Set to 1 to indicate 'reviewed'
      },
      {
        where: {
          eventId,
          id: abstractId,
        },
      }
    );

    console.log(`Updated ${result[0]} record(s).`);
  } catch (error) {
    console.error("Error updating abstract as reviewed:", error);
    throw error; // Propagate the error to be handled by the caller
  }
}

export async function cancelAbstractReviewDraftStatus(
  eventId: string,
  abstractId: number
): Promise<void> {
  try {
    console.log("in cancel draft service 1");
    const result = await AbstractReviews.update(
      {
        isDraft: 0, // Set to 1 to indicate 'reviewed'
      },
      {
        where: {
          eventId,
          abstractId,
        },
      }
    );
    console.log("in cancel draft service 2", result);
    console.log(`Updated.`, result);
  } catch (error) {
    console.error("Error updating abstract as reviewed:", error);
    throw error; // Propagate the error to be handled by the caller
  }
}

export async function checkChairmanNotificationStatus(
  eventId: string,
  abstractId: number
): Promise<boolean> {
  try {
    const abstract = await Abstracts.findOne({
      where: {
        eventId,
        id: abstractId,
      },
      attributes: ["isChairmanNotified"],
    });

    if (!abstract) {
      throw new Error("Abstract not found");
    }

    return abstract.isChairmanNotified;
  } catch (error) {
    console.error("Error fetching chairman notification status:", error);
    throw new Error("Failed to fetch chairman notification status");
  }
}

export async function checkAbstractIsReviewed(
  eventId: string,
  abstractId: number
): Promise<boolean> {
  try {
    const abstract = await Abstracts.findOne({
      where: {
        eventId,
        id: abstractId,
      },
      attributes: ["isReviewed"],
    });

    if (!abstract) {
      throw new Error("Abstract not found");
    }

    return abstract.isReviewed;
  } catch (error) {
    console.error("Error fetching chairman notification status:", error);
    throw new Error("Failed to fetch chairman notification status");
  }
}

export async function markAbstractAsChairmanNotified(
  eventId: string,
  abstractId: number
): Promise<void> {
  try {
    const result = await Abstracts.update(
      {
        isChairmanNotified: true, // Set to 1 to indicate 'reviewed'
      },
      {
        where: {
          eventId,
          id: abstractId,
        },
      }
    );

    console.log(`Updated ${result[0]} record(s).`);
  } catch (error) {
    console.error("Error updating abstract as reviewed:", error);
    throw error; // Propagate the error to be handled by the caller
  }
}

export async function getDeciderEmailsByEventId(
  eventId: string
): Promise<string[]> {
  try {
    const deciders = await AbstractReviewDeciders.findAll({
      where: { eventId },
      attributes: ["email"], // Only fetch the 'email' field
    });

    // Extract emails from the deciders
    const emails = deciders.map((decider) => decider.email);
    return emails;
  } catch (error) {
    console.error("Failed to retrieve emails:", error);
    throw new Error("Error retrieving emails from AbstractReviewDeciders.");
  }
}

export async function getToDeciderEmailTemplateByEventId(
  eventId: string
): Promise<{
  content: string;
  subject: string;
}> {
  try {
    const template = await AbstractReviewEmailTemplates.findOne({
      where: {
        eventId,
        scenario: "reviewEnds",
      },
      attributes: ["content", "subject"], // Only fetch the 'subject' and 'body' fields
    });

    if (!template) {
      throw new Error("No template found for the given event ID.");
    }

    return { content: template.content, subject: template.subject };
  } catch (error) {
    console.error("Failed to retrieve email template:", error);
    throw new Error(
      "Error retrieving email template from AbstractReviewEmailTemplates."
    );
  }
}

export async function getAbstractS3FileKeyById(
  abstractId: number
): Promise<string> {
  try {
    const abstract = await Abstracts.findOne({
      where: { id: abstractId },
      attributes: ["s3FileKey"],
    });

    if (!abstract) {
      throw new Error("No template found for the given event ID.");
    }

    return abstract.s3FileKey;
  } catch (error) {
    console.error("Failed to retrieve email template:", error);
    throw new Error(
      "Error retrieving email template from AbstractReviewEmailTemplates."
    );
  }
}

export async function getAbstractUserFileNameById(
  abstractId: number
): Promise<string> {
  try {
    const abstract = await Abstracts.findOne({
      where: { id: abstractId },
      attributes: ["fileName"],
    });

    if (!abstract) {
      throw new Error("No template found for the given event ID.");
    }

    return abstract.fileName;
  } catch (error) {
    console.error("Failed to retrieve email template:", error);
    throw new Error(
      "Error retrieving email template from AbstractReviewEmailTemplates."
    );
  }
}

export async function deleteAbstractReviewByIds(
  abstractId: number,
  eventId: string,
  reviewerId: number
): Promise<any> {
  // Change the return type to Promise of an array of AbstractReview
  try {
    // First, find all records that match the criteria
    const record = await AbstractReviews.findOne({
      where: {
        eventId: eventId,
        abstractId: abstractId,
        reviewerId: reviewerId,
      },
    });

    if (record) {
      // Then delete these records
      await AbstractReviews.destroy({
        where: {
          eventId: eventId,
          abstractId: abstractId,
          reviewerId: reviewerId,
        },
      });
      console.log(`Deleted ${record}.`);
    } else {
      console.log("No records found to delete.");
    }

    // Return the array of records that were deleted
    return record;
  } catch (error) {
    console.error("Error in deleting abstract review:", error);
    throw error; // Propagate the error to be handled by the caller
  }
}

export async function deductReviewerNumberForAbstract(
  abstractId: number,
  eventId: string
): Promise<any> {
  try {
    const abstract = await Abstracts.findOne({
      where: {
        id: abstractId,
        eventId,
      },
    });

    if (!abstract) {
      throw new Error("Abstract not found");
    }

    if (abstract.reviewerNumber > 0) {
      abstract.reviewerNumber -= 1;
      const updatedAbstract = await abstract.save();
      return updatedAbstract.get({ plain: true }) as any; // Ensuring type safety
    }

    if (abstract.reviewerNumber <= 0) {
      return;
    }
  } catch (error) {
    console.error("Failed to increment reviewer number:", error);
    throw error;
  }
}

export async function getEventStartEndData(eventId: string): Promise<any> {
  try {
    const event = await Event.findOne({
      where: {
        id: eventId,
      },
      attributes: ["start", "end"],
    });

    if (!event) {
      throw new Error("Abstract not found");
    }

    return {
      start: formatDateV2(event.start),
      end: formatDateV2(event.end),
    };
  } catch (error) {
    console.error("Error fetching chairman notification status:", error);
    throw new Error("Failed to fetch chairman notification status");
  }
}

export async function getReviewEndData(eventId: string): Promise<any> {
  try {
    const event = await AbstractReviewConfigs.findOne({
      where: {
        eventId: eventId,
      },
    });
    if (!event) {
      throw new Error("Abstract Review config not found");
    }
    return formatDateV2(event.abstractReviewDeadline);
  } catch (error) {
    console.error("Error fetching Abstract Review Config:", error);
    throw new Error("Failed to fetch Abstract Review Config");
  }
}

export async function getEventTopicById(
  eventId: string
): Promise<string | null> {
  const event = await Event.findOne({
    where: { id: eventId },
    attributes: ["topic"],
  });

  if (event) {
    return event.topic;
  } else {
    return null; // Return null if no configuration is found for the given eventId
  }
}

export async function getAbstractReviewsByAbstractId(
  abstractId: number
): Promise<ReviewCheckResult> {
  try {
    // Fetch all reviews by abstractId
    const reviews = await AbstractReviews.findAll({
      where: {
        abstractId: abstractId,
      },
    });

    const count = reviews.length;

    // Check if all reviews have isDraft as false
    const allNotDraft = reviews.every(
      (review) => review.isDraft !== null && !review.isDraft
    );

    return {
      count,
      allNotDraft,
    };
  } catch (error) {
    console.error("Error fetching reviews by abstract ID:", error);
    throw new Error("Failed to fetch reviews.");
  }
}

export async function handleSingleAbstractReviewSubmission(
  eventId: string,
  abstractId: number,
  reviewerId: number,
  comments: string,
  grades: string,
  isSubmission: boolean
) {
  try {
    // 1. Upsert the review directly
    await manageAbstractReview({
      abstractId,
      eventId,
      reviewerId,
      comments,
      grades,
      isSubmission,
    });

    // 2. Check if the review number matches the config and mark abstract as reviewed
    const reviewerNumberConfig = await getConfigAbstractReviewerNumber(eventId);
    const reviewerNumber = await getAbstractReviewerNumber(eventId, abstractId);
    const abstractIsReviewed = await checkAbstractIsReviewed(
      eventId,
      abstractId
    );
    const abstractReviews = await getAbstractReviewsByAbstractId(abstractId);

    console.log(
      "check abstractReviews, ",
      abstractReviews,
      abstractIsReviewed,
      reviewerNumber
    );

    // When abstract review based on config setting is completed
    if (
      reviewerNumberConfig === reviewerNumber &&
      reviewerNumber === abstractReviews.count &&
      abstractReviews.allNotDraft &&
      !abstractIsReviewed
    ) {
      await markAbstractAsReviewed(eventId, abstractId);
      // Implicitly notifify chairman / decider by showing the reviewed abstract in decider dashboard
      // without sending email
      await markAbstractAsChairmanNotified(eventId, abstractId);
    }

    // 3. Email Chairman when all event abstracts have been reviewed
    let allAbstractsAreReviewed = await areAllAbstractsReviewed(eventId);

    if (allAbstractsAreReviewed) {
      const emailTemplate: { content: string; subject: string } =
        await getToDeciderEmailTemplateByEventId(eventId);
      const recipients = await getDeciderEmailsByEventId(eventId);

      for (const recipent of recipients) {
        const emailContent = await generateReviewerReviewEndContent(emailTemplate.content, recipent, eventId);
        const mailOptions = getMailOptions(
          [recipent],
          emailContent,
          emailTemplate.subject
        );
        await sendEmail(mailOptions);
        await insertEmailDeliveryLog(
          generateEmailDeliveryLogData(
            eventId,
            abstractId,
            mailOptions.from,
            mailOptions.to,
            mailOptions.subject,
            emailTemplate.content,
            `Reviewer ${reviewerId}`
          )
        );
      }


    }
  } catch (error) {
    console.error("Error handling single abstract review:", error);
    throw error;
  }
}

export async function insertEmailDeliveryLog(
  logData: EmailDeliveryLogInput
): Promise<void> {
  try {
    await AbstractReviewEmailDeliveryLog.create({
      eventId: logData.eventId,
      abstractId: logData.abstractId,
      emailFrom: logData.emailFrom,
      emailTo: logData.emailTo,
      subject: logData.subject || "n/a",
      content: logData.content || "n/a",
      createdBy: logData.createdBy,
      updatedBy: logData.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      templateId: logData.templateId || 0,
      bcc: logData.bcc ? logData.bcc.join(";") : null,
    });
    console.log("Email delivery log inserted successfully");
  } catch (error) {
    console.error("Error inserting email delivery log:", error);
    throw new Error("Failed to insert email delivery log");
  }
}

export async function insertEmailDeliveryLogNew(
  logData: EmailDeliveryLogInputNew
): Promise<void> {
  try {
    await AbstractReviewEmailDeliveryLog.create({
      eventId: logData.eventId,
      abstractId: logData.abstractId,
      emailFrom: logData.emailFrom,
      emailTo: logData.emailTo,
      subject: logData.subject || "n/a",
      content: logData.content || "n/a",
      createdBy: logData.createdBy,
      updatedBy: logData.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      templateId: logData.templateId,
    });
    console.log("Email delivery log inserted successfully");
  } catch (error) {
    console.error("Error inserting email delivery log:", error);
    throw new Error("Failed to insert email delivery log");
  }
}

// Check if all abstracts have been reviewed, for emailing deciders
export async function areAllAbstractsReviewed(
  eventId: string
): Promise<boolean> {
  try {
    // Fetch the count of abstracts that are not reviewed
    const count = await Abstracts.count({
      where: {
        eventId: eventId,
        isReviewed: false, // Check if any abstract is not reviewed
      },
    });

    // If count is 0, then all abstracts are reviewed
    return count === 0;
  } catch (error) {
    console.error("Error checking if all abstracts are reviewed:", error);
    throw new Error("Failed to check review status of abstracts.");
  }
}

// Cron Job
export async function getAllEventIds(): Promise<string[]> {
  try {
    // Query AbstractReviewConfigs to get unique eventIds
    const eventIds = await AbstractReviewConfigs.findAll({
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("eventId")), "eventId"], // Get distinct eventId
      ],
      raw: true, // Return plain data, not Sequelize instances
    });

    // Extract the eventId values from the result and return as an array
    return eventIds.map((row) => row.eventId);
  } catch (error) {
    console.error("Error fetching event IDs:", error);
    throw new Error("Could not retrieve event IDs");
  }
}

// export async function getIncompleteReviews(eventId: string) {
//   try {
//     const reviewConfig = await AbstractReviewConfigs.findOne({
//       where: { eventId },
//       attributes: ["abstractReviewDeadline"],
//     });

//     if (!reviewConfig) {
//       throw new Error("Review configuration not found for the event");
//     }

//     const abstractReviewDeadline = new Date(
//       reviewConfig.abstractReviewDeadline
//     );

//     // Calculate 10 days before the deadline
//     const tenDaysBeforeDeadline = new Date(abstractReviewDeadline);
//     tenDaysBeforeDeadline.setDate(abstractReviewDeadline.getDate() - 10);

//     const incompleteReviews = await AbstractReviews.findAll({
//       where: {
//         eventId,
//         [Op.or]: [
//           { isDraft: 1 }, // Review is still in draft mode
//           {
//             comments: null, // Both comments and grades are missing
//             grades: null,
//           },
//         ],
//         // Check if `updatedAt` falls between 3 weeks before the deadline and the deadline
//         updatedAt: {
//           [Op.between]: [tenDaysBeforeDeadline, abstractReviewDeadline],
//         },
//       },
//     });

//     return incompleteReviews;
//   } catch (error) {
//     console.error("Error fetching incomplete reviews:", error);
//     throw new Error("Could not retrieve incomplete reviews");
//   }
// }

export async function getIncompleteReviews(eventId: string) {
  try {
    const reviewConfig = await AbstractReviewConfigs.findOne({
      where: { eventId },
      attributes: ["abstractReviewDeadline"],
    });

    if (!reviewConfig) {
      throw new Error("Review configuration not found for the event");
    }

    const abstractReviewDeadline = new Date(reviewConfig.abstractReviewDeadline);

    // Calculate 10 days before the deadline
    const tenDaysBeforeDeadline = new Date(abstractReviewDeadline);
    tenDaysBeforeDeadline.setDate(abstractReviewDeadline.getDate() - 10);

    // Get the current date
    const currentDate = new Date();

    // Check if the current date falls between tenDaysBeforeDeadline and abstractReviewDeadline
    if (currentDate < tenDaysBeforeDeadline || currentDate > abstractReviewDeadline) {
      return []; // Return an empty array if the current date is not within the range
    }

    const incompleteReviews = await AbstractReviews.findAll({
      where: {
        eventId,
        [Op.or]: [
          { isDraft: 1 }, // Review is still in draft mode
          {
            comments: null, // Both comments and grades are missing
            grades: null,
          },
        ],
        // You can remove the updatedAt condition since we are checking the current date
      },
    });

    return incompleteReviews;
  } catch (error) {
    console.error("Error fetching incomplete reviews:", error);
    throw new Error("Could not retrieve incomplete reviews");
  }
}

export async function getAbstractTitleById(abstractId: number) {
  try {
    const abstract = await Abstracts.findOne({
      where: { id: abstractId },
      attributes: ["title"],
    });

    if (!abstract) {
      throw new Error("Abstract not found");
    }

    return abstract.title;
  } catch (error) {
    console.error("Error fetching abstract title:", error);
    throw new Error("Could not retrieve abstract title");
  }
}

export async function getReviewerEmailById(reviewerId: number) {
  try {
    const reviewer = await AbstractReviewers.findOne({
      where: { id: reviewerId },
      attributes: ["email"],
    });

    if (!reviewer) {
      throw new Error("Reviewer not found");
    }

    return reviewer.email;
  } catch (error) {
    console.error("Error fetching reviewer email:", error);
    throw new Error("Could not retrieve reviewer email");
  }
}

export async function getPresentationModeEnable(eventId: string) {
  try {
    const visibleField = await AbstractReviewConfigs.findOne({
      where: { eventId: eventId },
      attributes: ["abstractSubmissionFormVisibleFields"],
    });

    return visibleField.abstractSubmissionFormVisibleFields.split(":::").includes("presentation_mode");
  } catch (error) {
    console.error("Error fetching reviewer email:", error);
    throw new Error("Could not retrieve reviewer email");
  }
}

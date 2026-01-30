import {
  Abstracts,
  AbstractReviewers,
  AbstractReviewConfigs,
  AbstractSubmitters,
  AbstractReviews,
  AbstractTopics,
  AbstractReviewDeciders,
  AbstractReviewEmailTemplates,
  AbstractReviewFinalDecisions,
  AbstractReviewEmailDeliveryLog,
  AbstractSubmissionPresentationModeOptionConfigs,
  AbstractSubmissionFormCustomQuestionReplies,
  AbstractSubmissionFormCustomQuestions,
  AbstractSubmissionPresentationModeOptions
} from "../../repo/eventAbstractReviews";
import { Event } from "../../repo/event";
import { Op, Sequelize } from "sequelize";
import {
  formatDateV2,
  processAbstractForFinalDecision,
  formatAbstractDetailsForFinalDecision,
} from "../../utilities/payload";
import { getOverallRating } from "../../utilities/payload";
import {
  DeciderComment,
  DeciderRating,
  EmailDeliveryLogInput,
} from "./interfaces";
export const JOIN_SYMBOL = ":::";

export async function getDeciderIdByEmail(
  email: string,
  eventId: string
): Promise<number | null> {
  try {
    const decider = await AbstractReviewDeciders.findOne({
      where: {
        eventId,
        email,
      },
      attributes: ["id"], // Only select the 'id' field
    });

    if (decider) {
      return decider.id;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching reviewer by email: ", error);
    return null;
  }
}

export async function getAbstractsWithReviewResults(
  eventId: string,
  isSingleReviewerRequired: boolean,
  isGradedByScoring: boolean
): Promise<any> {
  const result: any = await Abstracts.findAll({
    where: {
      eventId: eventId,
      isReviewed: true,
      isChairmanNotified: true,
    },
    include: [
      {
        model: AbstractSubmitters,
        attributes: [
          "title",
          "firstName",
          "lastName",
          "institution",
          "position",
          "department",
          "mobilePhone",
          "country",
          "email",
        ],
      },
      {
        model: AbstractTopics,
        attributes: ["topic"],
      },
      {
        model: AbstractReviews,
        include: [
          {
            model: AbstractReviewers,
            attributes: [
              "title",
              "firstName",
              "lastName",
              "position",
              "department",
              "institution",
              "email",
              "mobilePhone",
            ],
          },
        ],
        attributes: ["comments", "grades"],
      },
      {
        model: AbstractReviewFinalDecisions,
        attributes: ["comments", "grades", "suggestedPresentationMode"],
        required: false, // This makes the join an outer join, meaning it won't exclude abstracts without a final decision
      },
    ],
    attributes: ["id", "title", "description", "createdAt", "updatedAt", "selectedPresentationMode", "submitterId"],
  });

  await Promise.all(result.map(async (abstract: { selectedPresentationMode: string; setDataValue: (arg0: string, arg1: string) => void; fileName: WithImplicitCoercion<string> | { [Symbol.toPrimitive](hint: "string"): string; }; submitterId: any; }) => {
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
    abstracts: result.map((abstract: any) => {
      let overallRating = getOverallRating(
        isSingleReviewerRequired,
        isGradedByScoring,
        abstract.AbstractReviews
      );

      const finalComments =
        abstract.AbstractReviewFinalDecision?.comments || "n/a";
      const finalGrades = abstract.AbstractReviewFinalDecision?.grades || "n/a";
      const suggestedPresentationMode =
        abstract.AbstractReviewFinalDecision?.suggestedPresentationMode || "n/a";

      return {
        id: abstract.id,
        title: abstract.title,
        description: abstract.description,
        topic: abstract.AbstractTopic?.topic,
        createdDate: formatDateV2(abstract.createdAt),
        updatedDate: formatDateV2(abstract.updatedAt),
        submitterName: `${abstract.AbstractSubmitter?.title} ${abstract.AbstractSubmitter?.firstName} ${abstract.AbstractSubmitter?.lastName}`,
        submitterInstitution: abstract.AbstractSubmitter?.institution,
        submitterPosition: abstract.AbstractSubmitter?.position,
        submitterDepartment: abstract.AbstractSubmitter?.department,
        submitterCountry: abstract.AbstractSubmitter?.country,
        submitterEmail: abstract.AbstractSubmitter?.email,
        submitterMobilePhone: abstract.AbstractSubmitter?.mobilePhone,
        assessment: abstract.AbstractReviews.map((review: any) => ({
          reviewer: `${review.AbstractReviewer.title} ${review.AbstractReviewer.firstName} ${review.AbstractReviewer.lastName} `,
          reviewerPosition: review.AbstractReviewer.position,
          reviewerInstitution: review.AbstractReviewer.institution,
          reviewerDepartment: review.AbstractReviewer.department,
          reviewerEmail: review.AbstractReviewer.email,
          reviewerMobilePhone: review.AbstractReviewer.mobilePhone,
          comment: review.comments,
          rating: review.grades,
        })),
        isGradedByScoring: isGradedByScoring,
        overallRating: overallRating,
        finalComments,
        finalGrades,
        suggestedPresentationMode,
        presentationMode: abstract.dataValues.presentationMode ?? "",
        customQuestion0: abstract.dataValues.customQuestion0 ?? "",
        customQuestion1: abstract.dataValues.customQuestion1 ?? "",
        customQuestion2: abstract.dataValues.customQuestion2 ?? "",
        customQuestion3: abstract.dataValues.customQuestion3 ?? "",
        customQuestion4: abstract.dataValues.customQuestion4 ?? "",
        customQuestion5: abstract.dataValues.customQuestion5 ?? "",
        customQuestion6: abstract.dataValues.customQuestion6 ?? "",
        customQuestion7: abstract.dataValues.customQuestion7 ?? "",
        customQuestion8: abstract.dataValues.customQuestion8 ?? "",
        customQuestion9: abstract.dataValues.customQuestion9 ?? "",
      };
    }),
    customQuestionCollection: customQuestionCollection.map(item => item.question)
  }
}

export async function getGradingMethodByEventId(
  eventId: string
): Promise<string | null> {
  const config = await AbstractReviewConfigs.findOne({
    where: { eventId: eventId },
    attributes: ["gradingMethod"],
  });

  if (config) {
    return config.gradingMethod;
  } else {
    return null; // Return null if no configuration is found for the given eventId
  }
}

export async function getRequiredReviewerNumberPerAbstractByEventId(
  eventId: string
): Promise<number | null> {
  const config = await AbstractReviewConfigs.findOne({
    where: { eventId: eventId },
    attributes: ["reviewerPerAbstract"],
  });

  if (config) {
    return config.reviewerPerAbstract;
  } else {
    return null; // Return null if no configuration is found for the given eventId
  }
}

export async function getPendingAbstractFinalDecisions(
  eventId: string,
  isSingleReviewerRequired: boolean,
  isGradedByScoring: boolean
): Promise<any> {
  try {
    const abstracts = await Abstracts.findAll({
      where: {
        eventId,
        isReviewed: true,
        isChairmanNotified: true,
        isReviewFinalized: false,
      },
      include: [
        {
          model: AbstractSubmitters,
          attributes: [
            "institution",
            "position",
            "title",
            "firstName",
            "lastName",
            "email",
          ],
        },
        { model: AbstractTopics, attributes: ["topic"] },
        {
          model: AbstractReviews,
          include: [
            {
              model: AbstractReviewers,
              attributes: [
                "firstName",
                "lastName",
                "position",
                "institution",
                "title",
                "email",
              ],
            },
          ],
          attributes: ["comments", "grades"],
        },
      ],
      attributes: ["id", "title", "description", "selectedPresentationMode", "submitterId"],
    });

    await Promise.all(abstracts.map(async abstract => {
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

    const enhancedResults = await Promise.all(
      abstracts.map((abstract) =>
        processAbstractForFinalDecision(
          abstract,
          eventId,
          isSingleReviewerRequired,
          isGradedByScoring,
          "pending"
        )
      )
    );

    const customQuestionCollection = await AbstractSubmissionFormCustomQuestions.findAll({
      where: {
        eventId: eventId
      },
      order: [['id', 'ASC']]
    });

    return {
      abstracts: enhancedResults,
      customQuestionCollection: customQuestionCollection.map(item => item.question)
    }
  } catch (error) {
    console.error("Error fetching pending abstract final decisions: ", error);
    throw error;
  }
}

export async function getAbstractReviewFinalDecisionsByIds(
  eventId: string,
  abstractId: number
): Promise<any> {
  try {
    const decisions = await AbstractReviewFinalDecisions.findOne({
      where: {
        eventId: eventId,
        abstractId: abstractId,
        [Op.or]: [
          {
            isDraft: { [Op.is]: null },
            isUnderDiscussionWithSubmitter: { [Op.is]: null },
          },
          {
            isDraft: true,
          },
          {
            isUnderDiscussionWithSubmitter: true,
          },
        ],
      },
      attributes: [
        "comments",
        "grades",
        "isDraft",
        "isUnderDiscussionWithSubmitter",
        "createdAt",
        "updatedAt",
      ],
    });

    return decisions; // Returns the fetched decisions
  } catch (error) {
    console.error(
      "Error fetching AbstractReviewFinalDecisions by eventId:",
      error
    );
    throw error; // Rethrow or handle error appropriately
  }
}

export async function getSubmittedAbstractFinalDecisions(
  eventId: string,
  isSingleReviewerRequired: boolean,
  isGradedByScoring: boolean
): Promise<any> {
  try {
    const abstracts = await Abstracts.findAll({
      where: {
        eventId,
        isReviewed: true,
        isChairmanNotified: true,
        isReviewFinalized: true,
      },
      include: [
        {
          model: AbstractSubmitters,
          attributes: [
            "institution",
            "position",
            "title",
            "firstName",
            "lastName",
            "email",
          ],
        },
        { model: AbstractTopics, attributes: ["topic"] },
        {
          model: AbstractReviews,
          include: [
            {
              model: AbstractReviewers,
              attributes: [
                "firstName",
                "lastName",
                "position",
                "institution",
                "title",
                "email",
              ],
            },
          ],
          attributes: ["comments", "grades"],
        },
      ],
      attributes: ["id", "title", "description", "submitterId", "selectedPresentationMode"],
    });

    await Promise.all(abstracts.map(async abstract => {
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

    const enhancedResults = await Promise.all(
      abstracts.map((abstract) =>
        processAbstractForFinalDecision(
          abstract,
          eventId,
          isSingleReviewerRequired,
          isGradedByScoring,
          "submitted"
        )
      )
    );

    const customQuestionCollection = await AbstractSubmissionFormCustomQuestions.findAll({
      where: {
        eventId: eventId
      },
      order: [['id', 'ASC']]
    });

    return {
      abstracts: enhancedResults,
      customQuestionCollection: customQuestionCollection.map(item => item.question)
    }
  } catch (error) {
    console.error("Error fetching pending abstract final decisions: ", error);
    throw error;
  }
}

export async function getSubmittedAbstractReviewFinalDecisionsByIds(
  eventId: string,
  abstractId: number
): Promise<any> {
  try {
    const decisions = await AbstractReviewFinalDecisions.findOne({
      where: {
        eventId: eventId,
        abstractId: abstractId,
        isDraft: false,
        isUnderDiscussionWithSubmitter: false,
      },
      attributes: [
        "comments",
        "grades",
        "createdAt",
        "updatedAt",
        "suggestedPresentationMode",
      ],
    });

    return decisions; // Returns the fetched decisions
  } catch (error) {
    console.error(
      "Error fetching AbstractReviewFinalDecisions by eventId:",
      error
    );
    throw error; // Rethrow or handle error appropriately
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

export async function getEventContactPersonEmailById(
  eventId: string
): Promise<string | null> {
  const event = await Event.findOne({
    where: { id: eventId },
    attributes: ["contactEmail"],
  });

  if (event) {
    return event.contactEmail;
  } else {
    return null; // Return null if no configuration is found for the given eventId
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

export async function markAbstractAsUnderDiscussionWithSubmitter(
  eventId: string,
  abstractId: number
): Promise<void> {
  try {
    const result = await AbstractReviewFinalDecisions.update(
      {
        isUnderDiscussionWithSubmitter: true, // Set to 1 to indicate 'reviewed'
      },
      {
        where: {
          eventId,
          abstractId,
        },
      }
    );

    console.log(`Updated ${result[0]} record(s).`);
  } catch (error) {
    console.error("Error updating abstract as reviewed:", error);
    throw error; // Propagate the error to be handled by the caller
  }
}

export async function markIsDraft(
  eventId: string,
  abstractId: number
): Promise<void> {
  try {
    const result = await AbstractReviewFinalDecisions.update(
      {
        isDraft: true, // Set to 1 to indicate 'reviewed'
      },
      {
        where: {
          eventId,
          abstractId,
        },
      }
    );

    console.log(`Updated ${result[0]} record(s).`);
  } catch (error) {
    console.error("Error updating abstract as reviewed:", error);
    throw error; // Propagate the error to be handled by the caller
  }
}

export async function markAbstractFinalResult(
  eventId: string,
  abstractId: number,
  rating: string
): Promise<void> {
  try {
    const result = await Abstracts.update(
      {
        finalResult: rating,
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

export async function markAbstractReviewAsFinalized(
  eventId: string,
  abstractId: number
): Promise<void> {
  try {
    // Update the flags in AbstractReviewFinalDecisions
    const decisionResult = await AbstractReviewFinalDecisions.update(
      {
        isUnderDiscussionWithSubmitter: false, // Set to false to indicate no longer under discussion
        isDraft: false, // Set to false to indicate not a draft
      },
      {
        where: {
          eventId,
          abstractId,
        },
      }
    );

    console.log(
      `Updated ${decisionResult[0]} record(s) in AbstractReviewFinalDecisions.`
    );

    // Update the isReviewFinalized flag in Abstracts
    const abstractResult = await Abstracts.update(
      {
        isReviewFinalized: true, // Set to true to indicate the review is finalized
      },
      {
        where: {
          eventId,
          id: abstractId, // Assuming 'id' is the primary key in the Abstracts table
        },
      }
    );

    console.log(`Updated ${abstractResult[0]} record(s) in Abstracts.`);
  } catch (error) {
    console.error("Error updating abstract flags:", error);
    throw error; // Propagate the error to be handled by the caller
  }
}

export async function insertDeciderComment(data: DeciderComment): Promise<any> {
  let { abstractId, eventId, comments, deciderId } = data;

  try {
    const existingRecord = await AbstractReviewFinalDecisions.findOne({
      where: {
        abstractId,
        eventId,
      },
    });

    let instance;
    let created = false;

    if (existingRecord) {
      // Update the existing record
      await existingRecord.update({
        comments,
        deciderId,
        updatedAt: new Date(),
        updatedBy: `decider-${deciderId.toString()}`,
      });
      instance = existingRecord;
    }

    if (!existingRecord) {
      // Create a new record
      instance = await AbstractReviewFinalDecisions.create({
        abstractId,
        eventId,
        comments,
        deciderId,
        grades: "n/a", // Set default grades if it's required
        createdAt: new Date(),
        createdBy: `decider-${deciderId.toString()}`, // Or set this dynamically based on the user
        updatedAt: new Date(),
        updatedBy: "system", // Or set this dynamically based on the user
        isUnderDiscussionWithSubmitter: null,
        isDraft: null,
      });
      created = true;
    }

    console.log(
      created ? "Created a new record." : "Updated an existing record."
    );
    return instance.get({ plain: true }); // Returning the plain data object
  } catch (error) {
    console.error("Error in upsert operation:", error);
    throw error; // Propagate the error to be handled by the caller
  }
}

export async function getDeciderAssessment(
  eventId: string,
  abstractId: number
): Promise<any | null> {
  try {
    const deciderAssessment = await AbstractReviewFinalDecisions.findOne({
      where: {
        eventId,
        abstractId,
      },
      attributes: ["comments", "grades"], // Only fetch the reviewerNumber
    });

    if (deciderAssessment) {
      return {
        comment: deciderAssessment.comments,
        rating: deciderAssessment.grades,
      };
    } else {
      console.log("No Abstract Config Found");
      return null; // Return null if no abstract is found
    }
  } catch (error) {
    console.error("Error fetching reviewer number:", error);
    throw error; // Propagate the error to be handled by the caller
  }
}

export async function insertDeciderRating(data: DeciderRating): Promise<any> {
  let { abstractId, eventId, rating, deciderId, suggestedPresentationMode } =
    data;

  try {
    const existingRecord = await AbstractReviewFinalDecisions.findOne({
      where: {
        abstractId,
        eventId,
      },
    });

    let instance;
    let created = false;

    if (existingRecord) {
      // Update the existing record
      await existingRecord.update({
        grades: rating,
        suggestedPresentationMode,
        deciderId,
        updatedAt: new Date(),
        updatedBy: `decider-${deciderId.toString()}`,
      });
      instance = existingRecord;
    }

    if (!existingRecord) {
      // Create a new record
      instance = await AbstractReviewFinalDecisions.create({
        abstractId,
        eventId,
        comments: "n/a",
        deciderId,
        grades: rating,
        suggestedPresentationMode,
        createdAt: new Date(),
        createdBy: `decider-${deciderId.toString()}`, // Or set this dynamically based on the user
        updatedAt: new Date(),
        updatedBy: "system", // Or set this dynamically based on the user
        isUnderDiscussionWithSubmitter: null,
        isDraft: null,
      });
      created = true;
    }

    console.log(
      created ? "Created a new record." : "Updated an existing record."
    );
    return instance.get({ plain: true }); // Returning the plain data object
  } catch (error) {
    console.error("Error in upsert operation:", error);
    throw error; // Propagate the error to be handled by the caller
  }
}

export async function getAbstractS3FileKeyById(
  abstractId: number,
  eventId: string
): Promise<string> {
  try {
    const abstract = await Abstracts.findOne({
      where: { id: abstractId, eventId },
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
  abstractId: number,
  eventId: string
): Promise<string> {
  try {
    const abstract = await Abstracts.findOne({
      where: { id: abstractId, eventId },
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

export async function areAllAbstractsFinalized(
  eventId: string
): Promise<boolean> {
  try {
    // Count the total number of abstracts linked to the event
    const totalAbstracts = await Abstracts.count({
      where: { eventId },
    });

    // Count the number of finalized abstracts linked to the event
    const finalizedAbstracts = await Abstracts.count({
      where: { eventId, isReviewFinalized: true },
    });
    console.log("check finalization #, ", totalAbstracts, finalizedAbstracts);
    // If the number of finalized abstracts equals the total number of abstracts, return true
    return totalAbstracts > 0 && totalAbstracts === finalizedAbstracts;
  } catch (error) {
    console.error("Error checking if all abstracts are finalized:", error);
    throw error;
  }
}

export async function getSubmitterEmailByAbstractIdAndEventId(
  abstractId: number,
  eventId: string
): Promise<string | null> {
  try {
    // Find the abstract by abstractId and eventId
    const abstract: any = await Abstracts.findOne({
      where: {
        id: abstractId,
        eventId: eventId,
      },
      include: [
        {
          model: AbstractSubmitters,
          as: "AbstractSubmitter",
          attributes: ["email"], // Only select the email field,
          required: true,
        },
      ],
    });
    // If the abstract or the associated submitter is not found, return null
    if (!abstract || !abstract.AbstractSubmitter) {
      console.error("NO abstract / submitter information!");
      console.log("s-3");
      return null;
    }

    // Return the email of the submitter
    return abstract.AbstractSubmitter.email;
  } catch (error) {
    console.error("Error fetching submitter email:", error);
    throw error;
  }
}

export async function getEmailTemplateContentByEventIdAndScenario(
  eventId: string,
  scenario: string
): Promise<{ content: string | null; subject: string | null }> {
  try {
    // Find the email template by eventId and scenario
    const emailTemplate = await AbstractReviewEmailTemplates.findOne({
      where: {
        eventId: eventId,
        scenario: scenario,
      },
      attributes: ["content", "subject"], // Select the content and subject fields
    });

    // If the template is not found, return null for both fields
    if (!emailTemplate) {
      return { content: null, subject: null };
    }

    // Return an object containing the content and subject of the email template
    return {
      content: emailTemplate.content,
      subject: emailTemplate.subject,
    };
  } catch (error) {
    console.error("Error fetching email template content:", error);
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
    });
    console.log("Email delivery log inserted successfully");
  } catch (error) {
    console.error("Error inserting email delivery log:", error);
    throw new Error("Failed to insert email delivery log");
  }
}

export async function getPresentationConfig(eventId: string): Promise<any> {
  try {
    const presentationModeCollection = await AbstractSubmissionPresentationModeOptionConfigs.findAll({
      where: { eventId: eventId },
    });

    // const presentationMode = {
    //   oral: presentationModeCollection.filter(mode => mode.presentationModeId === 1)[0]?.isEnabled ?? false,
    //   posterecopy: presentationModeCollection.filter(mode => mode.presentationModeId === 2)[0]?.isEnabled ?? false,
    //   posterhardcopy: presentationModeCollection.filter(mode => mode.presentationModeId === 3)[0]?.isEnabled ?? false,
    //   anyone: presentationModeCollection.filter(mode => mode.presentationModeId === 4)[0]?.isEnabled ?? false
    // };

    const presentationModeOptions = await AbstractSubmissionPresentationModeOptions.findAll();

    const presentationMode: Record<string, boolean> = {};
    for (const option of presentationModeOptions) {
      const modeId = option.id;
      const modeName = option.mode;

      presentationMode[modeName] = presentationModeCollection.filter(mode => mode.presentationModeId === modeId)[0]?.isEnabled ?? false;
    }

    return presentationMode;
  } catch (error) {
    throw new Error("Failed to fetch presentation mode config");
  }
}

export async function getPresentationModeOptions(): Promise<any> {
  try {
    const presentationModeOptions = await AbstractSubmissionPresentationModeOptions.findAll();

    return presentationModeOptions;
  } catch (error) {
    throw new Error("Failed to fetch presentation mode config");
  }
}

export async function getPresentationVisible(eventId: string): Promise<any> {
  try {
    const abstractReviewConfig = await AbstractReviewConfigs.findOne({
      where: { eventId: eventId },
    });

    return abstractReviewConfig.abstractSubmissionFormVisibleFields.split(JOIN_SYMBOL).includes("presentation_mode") ? true : false;
  } catch (error) {
    throw new Error("Failed to fetch presentation mode config");
  }
}
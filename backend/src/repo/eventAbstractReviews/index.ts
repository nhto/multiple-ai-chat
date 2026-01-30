import { sequelize } from "../../utilities/database";
import { initAbstractTopics } from "./abstractTopics";
import { initAbstractSubmitters } from "./abstractSubmitters";
import { initAbstracts } from "./abstracts";
import { initAbstractReviewers } from "./abstractReviewers";
import { initAbstractReviews } from "./abstractReviews";
import { initAbstractReviewFinalDecisions } from "./abstractReviewFinalDecisions";
import { initAbstractReviewConfigs } from "./abstractReviewConfigs";
import { initAbstractShortlistingSubmissions } from "./abstractShortlistingSubmissions";
import { initAbstractReviewEmailTemplates } from "./abstractReviewEmailTemplates";
import { initAbstractSubmissionFormCustomQuestions } from "./abstractSubmissionFormCustomQuestions";
import { initAbstractSubmissionFormCustomQuestionReplies } from "./abstractSubmissionFormCustomQuestionReplies";
import { initAbstractReviewDeciders } from "./abstractReviewDeciders";
import { initAbstractCommentReception } from "./abstractCommentReception";
import { initAbstractReviewEmailDeliveryLog } from "./abstractReviewEmailDeliveryLog";
import { initAbstractSubmissionFormCustomQuestionConfig } from "./abstractSubmissionFormCustomQuestionConfig";
import { initAbstractSubmissionPresentationModeOptions } from "./abstractSubmissionPresentationModeOptions";
import { initAbstractSubmissionPresentationModeOptionConfigs } from "./AbstractSubmissionPresentationModeOptionConfigs";

// Initialize models
const AbstractTopics = initAbstractTopics(sequelize);
const AbstractSubmitters = initAbstractSubmitters(sequelize);
const Abstracts = initAbstracts(sequelize);
const AbstractReviewers = initAbstractReviewers(sequelize);
const AbstractReviews = initAbstractReviews(sequelize);
const AbstractReviewFinalDecisions =
  initAbstractReviewFinalDecisions(sequelize);
const AbstractReviewConfigs = initAbstractReviewConfigs(sequelize);
const AbstractShortlistingSubmissions =
  initAbstractShortlistingSubmissions(sequelize);
const AbstractReviewEmailTemplates =
  initAbstractReviewEmailTemplates(sequelize);
const AbstractSubmissionFormCustomQuestions =
  initAbstractSubmissionFormCustomQuestions(sequelize);
const AbstractSubmissionFormCustomQuestionReplies =
  initAbstractSubmissionFormCustomQuestionReplies(sequelize);
const AbstractReviewDeciders = initAbstractReviewDeciders(sequelize);
const AbstractCommentReception = initAbstractCommentReception(sequelize);
const AbstractReviewEmailDeliveryLog =
  initAbstractReviewEmailDeliveryLog(sequelize);
const AbstractSubmissionFormCustomQuestionConfig =
  initAbstractSubmissionFormCustomQuestionConfig(sequelize);
const AbstractSubmissionPresentationModeOptions =
  initAbstractSubmissionPresentationModeOptions(sequelize);
const AbstractSubmissionPresentationModeOptionConfigs =
  initAbstractSubmissionPresentationModeOptionConfigs(sequelize);

// Define Associations
// (1) AbstractTopics
AbstractTopics.hasMany(AbstractReviewers, { foreignKey: "topicId" });
AbstractTopics.hasMany(Abstracts, { foreignKey: "topicId" });

// (2) AbstractSubmitters
AbstractSubmitters.hasMany(Abstracts, { foreignKey: "submitterId" });
AbstractSubmitters.hasMany(AbstractSubmissionFormCustomQuestionReplies, {
  foreignKey: "submitterId",
});

// (3) Abstracts
Abstracts.belongsTo(AbstractSubmitters, { foreignKey: "submitterId" });
Abstracts.belongsTo(AbstractTopics, { foreignKey: "topicId" });
Abstracts.hasMany(AbstractReviews, { foreignKey: "abstractId" });
Abstracts.hasMany(AbstractShortlistingSubmissions, {
  foreignKey: "abstractId",
});
Abstracts.hasOne(AbstractReviewFinalDecisions, {
  foreignKey: "abstractId",
});

// (4) AbstractReviewers
AbstractReviewers.belongsTo(AbstractTopics, { foreignKey: "topicId" });
AbstractReviewers.hasMany(AbstractReviews, { foreignKey: "reviewerId" });

// (5) AbstractReviews
AbstractReviews.belongsTo(Abstracts, { foreignKey: "abstractId" });
AbstractReviews.belongsTo(AbstractReviewers, { foreignKey: "reviewerId" });

// (6) AbstractReviewFinalDecisions
AbstractReviewFinalDecisions.belongsTo(Abstracts, {
  foreignKey: "abstractId",
});
AbstractReviewFinalDecisions.belongsTo(AbstractReviewDeciders, {
  foreignKey: "deciderId",
});

// (7) AbstractShortlistingSubmissions
AbstractShortlistingSubmissions.belongsTo(Abstracts, {
  foreignKey: "abstractId",
});

// (8) AbstractSubmissionFormCustomQuestionReplies
AbstractSubmissionFormCustomQuestionReplies.belongsTo(AbstractSubmitters, {
  foreignKey: "submitterId",
});
AbstractSubmissionFormCustomQuestionReplies.belongsTo(
  AbstractSubmissionFormCustomQuestions,
  { foreignKey: "customQuestionId" }
);

// (9) AbstractSubmissionFormCustomQuestions
AbstractSubmissionFormCustomQuestions.hasMany(
  AbstractSubmissionFormCustomQuestionReplies,
  { foreignKey: "customQuestionId" }
);

AbstractSubmissionFormCustomQuestions.hasOne(
  AbstractSubmissionFormCustomQuestionConfig,
  {
    foreignKey: "customQuestionId",
    onDelete: "CASCADE", // Ensures referential integrity
  }
);

// (10) AbstractReviewDeciders
AbstractReviewDeciders.hasOne(AbstractReviewFinalDecisions, {
  foreignKey: "deciderId",
});

// (11) AbstractSubmissionFormCustomQuestionConfig
AbstractSubmissionFormCustomQuestionConfig.belongsTo(
  AbstractSubmissionFormCustomQuestions,
  {
    foreignKey: "customQuestionId",
    onDelete: "CASCADE", // Ensures related config is deleted if the question is deleted
  }
);

// (12)  AbstractSubmissionPresentationModeOptionConfig
AbstractSubmissionPresentationModeOptionConfigs.belongsTo(
  AbstractSubmissionPresentationModeOptions,
  {
    foreignKey: "presentationModeId",
    onDelete: "CASCADE", 
  }
);

// (13) AbstractSubmissionPresentationModeOptions
AbstractSubmissionPresentationModeOptions.hasOne(
  AbstractSubmissionPresentationModeOptionConfigs,
  {
    foreignKey: "presentationModeId",
    onDelete: "CASCADE", 
  }
);

export {
  AbstractTopics,
  AbstractSubmitters,
  Abstracts,
  AbstractReviewers,
  AbstractReviews,
  AbstractReviewFinalDecisions,
  AbstractReviewConfigs,
  AbstractShortlistingSubmissions,
  AbstractReviewEmailTemplates,
  AbstractSubmissionFormCustomQuestions,
  AbstractSubmissionFormCustomQuestionReplies,
  AbstractReviewDeciders,
  AbstractCommentReception,
  AbstractReviewEmailDeliveryLog,
  AbstractSubmissionPresentationModeOptionConfigs,
  AbstractSubmissionPresentationModeOptions,
  AbstractSubmissionFormCustomQuestionConfig
};

CREATE TABLE [dbo].[AbstractReviewConfigs]
(
	[id]					                        INT                 IDENTITY(1,1),
	[eventId]				                        NVARCHAR(MAX)	    NOT NULL,
	[reviewerPerAbstract]                           INT	            	NOT NULL DEFAULT 1,
	[abstractPerSubmitter]		                    INT		            NOT NULL DEFAULT 1,
    [allowSameInstitution]		                    BIT		            NOT NULL DEFAULT 1,
	[abstractPerTopic]		                        INT		            NULL,
    [gradingMethod]		                            NVARCHAR(255) 		NOT NULL DEFAULT 'text',
	[abstractSubmissionStartDate]		            DATETIME		    NOT NULL,
    [abstractSubmissionEndDate]		                DATETIME		    NOT NULL,
    [abstractSubmissionEnabled]		                BIT		            NOT NULL DEFAULT 1,
	[paperSubmissionEnabled]		                BIT		            NOT NULL DEFAULT 1,
    [abstractSubmissionAcceptedUserType]		    NVARCHAR(255)		NULL,
    [abstractDescriptionCharLimit]		            INT 		        NULL,
	[abstractSubmissionPageTitle]		            NVARCHAR(MAX)		NULL,
    [abstractSubmissionPageDescription]		        NVARCHAR(MAX)		NULL,
    [paperSubmissionPageTitle]		                NVARCHAR(MAX) 		NULL,
	[paperSubmissionPageDescription]		        NVARCHAR(MAX)		NULL,
    [abstractSubmissionFormVisibleFields]		    NVARCHAR(MAX)		NULL,
    [abstractSubmissionFormMandatoryFields]		    NVARCHAR(MAX) 		NULL,
	[abstractSubmissionNotificationBccAddress]		NVARCHAR(MAX)		NULL,
    [paperSubmissionNotificationBccAddress]		    NVARCHAR(MAX)		NULL,
    [abstractSubmissionNotificationContent]		    NVARCHAR(MAX)		NULL,
    [paperSubmissionNotificationContent]		    NVARCHAR(MAX)		NULL,
    [createdAt]				                        DATETIME			NOT NULL,
    [createdBy]				                        NVARCHAR(30)		NOT NULL,
    [updatedAt]				                        DATETIME			NOT NULL,
    [updatedBy]				                        NVARCHAR(30)		NOT NULL,
);

ALTER TABLE [dbo].[AbstractReviewConfigs]
ADD
    CONSTRAINT PK_dbo_AbstractReviewConfigs
    PRIMARY KEY CLUSTERED ([id])
;


CREATE TABLE [dbo].[AbstractSubmissionFormCustomQuestions]
(
	[id]					                        INT                 IDENTITY(1,1),
	[eventId]				                        NVARCHAR(MAX)	    NOT NULL,
	[question]                                      NVARCHAR(MAX)		NOT NULL,
	[replyCharLimit]		                        INT		            NOT NULL,
    [createdAt]				                        DATETIME			NOT NULL,
    [createdBy]				                        NVARCHAR(30)		NOT NULL,
    [updatedAt]				                        DATETIME			NOT NULL,
    [updatedBy]				                        NVARCHAR(30)		NOT NULL,
);

ALTER TABLE [dbo].[AbstractSubmissionFormCustomQuestions]
ADD
    CONSTRAINT PK_dbo_AbstractSubmissionFormCustomQuestions
    PRIMARY KEY CLUSTERED ([id])
;

CREATE TABLE [dbo].[AbstractSubmissionFormCustomQuestionReplies]
(
	[id]					                        INT                 IDENTITY(1,1),
	[eventId]				                        NVARCHAR(MAX)	    NOT NULL,
	[submitterId]                                   NVARCHAR(MAX)		NOT NULL,
	[customQuestionId]		                        INT		            NOT NULL,
    [reply]		                                    NVARCHAR(MAX)		NOT NULL,
    [createdAt]				                        DATETIME			NOT NULL,
    [createdBy]				                        NVARCHAR(30)		NOT NULL,
    [updatedAt]				                        DATETIME			NOT NULL,
    [updatedBy]				                        NVARCHAR(30)		NOT NULL,
);

ALTER TABLE [dbo].[AbstractSubmissionFormCustomQuestionReplies]
ADD
    CONSTRAINT PK_dbo_AbstractSubmissionFormCustomQuestionReplies
    PRIMARY KEY CLUSTERED ([id])
;

ALTER TABLE [dbo].[AbstractSubmissionFormCustomQuestionReplies]
ADD
    CONSTRAINT FK_dbo_AbstractSubmissionFormCustomQuestionReplies
	FOREIGN KEY ([customQuestionId]) REFERENCES [dbo].[AbstractSubmissionFormCustomQuestions]([id])
;

CREATE INDEX IX_dbo_AbstractSubmissionFormCustomQuestionReplies_customQuestionId
ON [dbo].[AbstractSubmissionFormCustomQuestionReplies]([customQuestionId])
;

CREATE TABLE [dbo].[AbstractSubmitters]
(
	[id]					                        INT                 IDENTITY(1,1),
	[eventId]				                        NVARCHAR(MAX)	    NOT NULL,
	[title]                                         NVARCHAR(MAX)		NULL,
	[firstName]		                                NVARCHAR(MAX)		NULL,
    [lastName]		                                NVARCHAR(MAX)		NULL,
    [email]                                         NVARCHAR(MAX)		NOT NULL,
    [mobilePhone]                                   NVARCHAR(MAX)		NULL,
    [officePhone]                                   NVARCHAR(MAX)		NULL,
    [position]                                      NVARCHAR(MAX)		NULL,
    [institution]                                   NVARCHAR(MAX)		NULL,
    [department]                                    NVARCHAR(MAX)		NULL,
    [country]                                       NVARCHAR(MAX)		NULL,
    [createdAt]				                        DATETIME			NOT NULL,
    [createdBy]				                        NVARCHAR(30)		NOT NULL,
    [updatedAt]				                        DATETIME			NOT NULL,
    [updatedBy]				                        NVARCHAR(30)		NOT NULL,
);

ALTER TABLE [dbo].[AbstractSubmitters]
ADD
    CONSTRAINT PK_dbo_AbstractSubmitters
    PRIMARY KEY CLUSTERED ([id])
;

CREATE TABLE [dbo].[AbstractShortlistingSubmission]
(
	[id]					                        INT                 IDENTITY(1,1),
	[eventId]				                        NVARCHAR(MAX)	    NOT NULL,
	[abstractId]                                    INT		            NOT NULL,
    [fileType]                                      NVARCHAR(MAX)		NOT NULL,
    [s3FileKey]                                     NVARCHAR(MAX)		NOT NULL,
    [createdAt]				                        DATETIME			NOT NULL,
    [createdBy]				                        NVARCHAR(30)		NOT NULL,
    [updatedAt]				                        DATETIME			NOT NULL,
    [updatedBy]				                        NVARCHAR(30)		NOT NULL,
);

ALTER TABLE [dbo].[AbstractShortlistingSubmission]
ADD
    CONSTRAINT PK_dbo_AbstractShortlistingSubmission
    PRIMARY KEY CLUSTERED ([id])
;

CREATE TABLE [dbo].[AbstractReviewFinalDecisions]
(
	[id]					                        INT                 IDENTITY(1,1),
	[eventId]				                        NVARCHAR(MAX)	    NOT NULL,
	[abstractId]                                    INT		            NOT NULL,
    [deciderId]                                     INT		            NOT NULL,
    [comments]                                      NVARCHAR(MAX)		NOT NULL,
    [grades]                                        NVARCHAR(MAX)		NOT NULL,
    [createdAt]				                        DATETIME			NOT NULL,
    [createdBy]				                        NVARCHAR(30)		NOT NULL,
    [updatedAt]				                        DATETIME			NOT NULL,
    [updatedBy]				                        NVARCHAR(30)		NOT NULL,
);

ALTER TABLE [dbo].[AbstractReviewFinalDecisions]
ADD
    CONSTRAINT PK_dbo_AbstractReviewFinalDecisions
    PRIMARY KEY CLUSTERED ([id])
;

CREATE TABLE [dbo].[AbstractReviewDeciders]
(
	[id]					                        INT                 IDENTITY(1,1),
	[eventId]				                        NVARCHAR(MAX)	    NOT NULL,
	[title]                                         NVARCHAR(MAX)		NULL,
    [firstName]                                     NVARCHAR(MAX)		NULL,
    [lastName]                                      NVARCHAR(MAX)		NULL,
    [email]                                         NVARCHAR(MAX)		NOT NULL,
    [phone]                                         NVARCHAR(MAX)		NULL,
    [position]                                      NVARCHAR(MAX)		NULL,
    [institution]                                   NVARCHAR(MAX)		NULL,
    [department]                                    NVARCHAR(MAX)		NULL,
    [country]                                       NVARCHAR(MAX)		NULL,
    [createdAt]				                        DATETIME			NOT NULL,
    [createdBy]				                        NVARCHAR(30)		NOT NULL,
    [updatedAt]				                        DATETIME			NOT NULL,
    [updatedBy]				                        NVARCHAR(30)		NOT NULL,
);

ALTER TABLE [dbo].[AbstractReviewDeciders]
ADD
    CONSTRAINT PK_dbo_AbstractReviewDeciders
    PRIMARY KEY CLUSTERED ([id])
;

ALTER TABLE [dbo].[AbstractReviewFinalDecisions]
ADD
    CONSTRAINT FK_dbo_AbstractReviewFinalDecisions
	FOREIGN KEY ([deciderId]) REFERENCES [dbo].[AbstractReviewDeciders]([id])
;

CREATE INDEX IX_dbo_AbstractReviewFinalDecisions_deciderId
ON [dbo].[AbstractReviewFinalDecisions]([deciderId])
;

CREATE TABLE [dbo].[AbstractTopics]
(
	[id]					                        INT                 IDENTITY(1,1),
	[eventId]				                        NVARCHAR(MAX)	    NOT NULL,
	[topic]                                         NVARCHAR(MAX)	    NOT NULL,
    [enable]                                        BIT		            NOT NULL DEFAULT 1,
    [createdAt]				                        DATETIME			NOT NULL,
    [createdBy]				                        NVARCHAR(30)		NOT NULL,
    [updatedAt]				                        DATETIME			NOT NULL,
    [updatedBy]				                        NVARCHAR(30)		NOT NULL,
);

ALTER TABLE [dbo].[AbstractTopics]
ADD
    CONSTRAINT PK_dbo_AbstractTopics
    PRIMARY KEY CLUSTERED ([id])
;

CREATE TABLE [dbo].[AbstractReviewers]
(
	[id]					                        INT                 IDENTITY(1,1),
	[eventId]				                        NVARCHAR(MAX)	    NOT NULL,
	[title]                                         NVARCHAR(MAX)		NULL,
    [firstName]                                     NVARCHAR(MAX)		NULL,
    [lastName]                                      NVARCHAR(MAX)		NULL,
    [email]                                         NVARCHAR(MAX)		NOT NULL,
    [officePhone]                                   NVARCHAR(MAX)		NULL,
    [mobilePhone]                                   NVARCHAR(MAX)		NULL,
    [position]                                      NVARCHAR(MAX)		NULL,
    [institution]                                   NVARCHAR(MAX)		NULL,
    [department]                                    NVARCHAR(MAX)		NULL,
    [country]                                       NVARCHAR(MAX)		NULL,
    [topicId]                                       INT		            NULL,
    [abstractNumber]                                INT		            NOT NULL DEFAULT 0,
    [createdAt]				                        DATETIME			NOT NULL,
    [createdBy]				                        NVARCHAR(30)		NOT NULL,
    [updatedAt]				                        DATETIME			NOT NULL,
    [updatedBy]				                        NVARCHAR(30)		NOT NULL,
);

ALTER TABLE [dbo].[AbstractReviewers]
ADD
    CONSTRAINT PK_dbo_AbstractReviewers
    PRIMARY KEY CLUSTERED ([id])
;

ALTER TABLE [dbo].[AbstractReviewers]
ADD
    CONSTRAINT FK_dbo_AbstractReviewers
	FOREIGN KEY ([topicId]) REFERENCES [dbo].[AbstractTopics]([id])
;

CREATE INDEX IX_dbo_AbstractReviewers_topicId
ON [dbo].[AbstractReviewers]([topicId])
;

CREATE TABLE [dbo].[AbstractReviews]
(
	[id]					                        INT                 IDENTITY(1,1),
	[eventId]				                        NVARCHAR(MAX)	    NOT NULL,
	[abstractId]                                    INT	                NOT NULL,
    [reviewerId]                                    INT		            NOT NULL,
    [comments]                                      NVARCHAR(MAX)	    NULL,
    [grades]                                        NVARCHAR(MAX)	    NULL,
    [createdAt]				                        DATETIME			NOT NULL,
    [createdBy]				                        NVARCHAR(30)		NOT NULL,
    [updatedAt]				                        DATETIME			NOT NULL,
    [updatedBy]				                        NVARCHAR(30)		NOT NULL,
);

ALTER TABLE [dbo].[AbstractReviews]
ADD
    CONSTRAINT PK_dbo_AbstractReviews
    PRIMARY KEY CLUSTERED ([id])
;

CREATE TABLE [dbo].[Abstracts]
(
	[id]					                        INT                 IDENTITY(1,1),
	[eventId]				                        NVARCHAR(MAX)	    NOT NULL,
	[submitterId]                                   INT	                NOT NULL,
    [topicId]                                       INT		            NOT NULL,
    [title]                                         NVARCHAR(MAX)	    NULL,
    [description]                                   NVARCHAR(MAX)	    NULL,
    [reviewerNumber]				                INT	                NOT NULL DEFAULT 0,
	[isSubmitted]                                   BIT	                NOT NULL DEFAULT 0,
    [isReviewed]                                    BIT	                NOT NULL DEFAULT 0,
    [isReviewFinalized]                             BIT	                NOT NULL DEFAULT 0,
    [finalResult]				                    NVARCHAR(MAX)	    NOT NULL,
	[isReviewerNotified]                            BIT	                NOT NULL DEFAULT 0,
    [isChairmanNotified]                            BIT	                NOT NULL DEFAULT 0,
    [isSubmitterNotified]                           BIT	                NOT NULL DEFAULT 0,
    [s3FileKey]                                     NVARCHAR(MAX)	    NOT NULL,
    [createdAt]				                        DATETIME			NOT NULL,
    [createdBy]				                        NVARCHAR(30)		NOT NULL,
    [updatedAt]				                        DATETIME			NOT NULL,
    [updatedBy]				                        NVARCHAR(30)		NOT NULL,
);

ALTER TABLE [dbo].[Abstracts]
ADD
    CONSTRAINT PK_dbo_Abstracts
    PRIMARY KEY CLUSTERED ([id])
;

ALTER TABLE [dbo].[Abstracts]
ADD
    CONSTRAINT FK_dbo_Abstracts_topicId
	FOREIGN KEY ([topicId]) REFERENCES [dbo].[AbstractTopics]([id])
;

CREATE INDEX IX_dbo_Abstracts_topicId
ON [dbo].[Abstracts]([topicId])
;

ALTER TABLE [dbo].[Abstracts]
ADD
    CONSTRAINT FK_dbo_Abstracts_submitterId
	FOREIGN KEY ([submitterId]) REFERENCES [dbo].[AbstractSubmitters]([id])
;

CREATE INDEX IX_dbo_Abstracts_submitterId
ON [dbo].[Abstracts]([submitterId])
;

ALTER TABLE [dbo].[AbstractShortlistingSubmission]
ADD
    CONSTRAINT FK_dbo_AbstractShortlistingSubmission_abstractId
	FOREIGN KEY ([abstractId]) REFERENCES [dbo].[Abstracts]([id])
;

CREATE INDEX IX_dbo_AbstractShortlistingSubmission_abstractId
ON [dbo].[AbstractShortlistingSubmission]([abstractId])
;

ALTER TABLE [dbo].[AbstractReviews]
ADD
    CONSTRAINT FK_dbo_AbstractReviews_abstractId
	FOREIGN KEY ([abstractId]) REFERENCES [dbo].[Abstracts]([id])
;

CREATE INDEX IX_dbo_AbstractReviews_abstractId
ON [dbo].[AbstractReviews]([abstractId])
;
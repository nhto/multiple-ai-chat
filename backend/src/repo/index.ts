import './session';
import './attendance';
import './department';
import './event';
import './roster';

import { Role } from './role';
import { User } from './user';
import { RoleUser } from './roleUser';
import { Participant } from './participant';
import { ParticipantSession } from './participantSession';
import { Attendance } from './attendance';

import { EventRegistration } from './eventRegistration';
import { EventRegistrationFormSession } from './eventRegistrationFormSession';
import { EventSession } from './eventSession';
import { Event } from './event';

import { Web } from './web';
import { FileCollection } from './fileCollection';
import { FileSubmission } from './fileSubmission';

import { CustomPaymentEvent } from './customPaymentEvent';
import { CustomPaymentItem } from './customPaymentItem';

import logger from '../utilities/logger';

logger.debug('Setting up database association...');

User.hasMany(RoleUser, { as: 'roleUsers', foreignKey: 'netId', sourceKey: 'netId' });
Role.hasMany(RoleUser, { as: 'roleUsers', foreignKey: 'roleLabel', sourceKey: 'roleLabel' });

RoleUser.hasOne(Role, { as: 'role', sourceKey: 'roleLabel', foreignKey: 'roleLabel' });
RoleUser.hasOne(User, { as: 'user', sourceKey: 'netId', foreignKey: 'netId' });

RoleUser.belongsTo(Event, { as: 'event', foreignKey: 'eventId', targetKey: 'id' });
Event.hasMany(RoleUser, { as: 'roles', foreignKey: 'eventId', sourceKey: 'id' });

EventRegistration.hasMany(EventRegistrationFormSession, { as: 'eventRegistrationFormSession', foreignKey: 'formId', sourceKey: 'id' });
EventRegistration.hasMany(Event, { as: 'event', foreignKey: 'id', sourceKey: 'eventId' });
EventRegistration.hasMany(CustomPaymentItem, { as: 'paymentTitle1Obj', foreignKey: 'itemId', sourceKey: 'paymentTitle1' });
EventRegistration.hasMany(CustomPaymentItem, { as: 'paymentTitle2Obj', foreignKey: 'itemId', sourceKey: 'paymentTitle2' });
EventRegistration.hasMany(CustomPaymentItem, { as: 'paymentTitle3Obj', foreignKey: 'itemId', sourceKey: 'paymentTitle3' });
EventRegistration.hasMany(CustomPaymentItem, { as: 'paymentTitle4Obj', foreignKey: 'itemId', sourceKey: 'paymentTitle4' });
EventRegistration.hasMany(CustomPaymentItem, { as: 'paymentTitle5Obj', foreignKey: 'itemId', sourceKey: 'paymentTitle5' });
EventRegistration.hasMany(CustomPaymentItem, { as: 'paymentTitle6Obj', foreignKey: 'itemId', sourceKey: 'paymentTitle6' });
EventRegistration.hasMany(CustomPaymentItem, { as: 'paymentTitle7Obj', foreignKey: 'itemId', sourceKey: 'paymentTitle7' });
EventRegistration.hasMany(CustomPaymentItem, { as: 'paymentTitle8Obj', foreignKey: 'itemId', sourceKey: 'paymentTitle8' });
EventRegistration.hasMany(CustomPaymentItem, { as: 'paymentTitle9Obj', foreignKey: 'itemId', sourceKey: 'paymentTitle9' });
EventRegistration.hasMany(CustomPaymentItem, { as: 'paymentTitle10Obj', foreignKey: 'itemId', sourceKey: 'paymentTitle10' });

EventRegistrationFormSession.hasMany(EventSession, { as: 'eventSession', foreignKey: 'id', sourceKey: 'sessionId' });
// EventRegistrationFormSession.hasMany(EventRegistration, { as: 'eventRegistration', foreignKey: 'id', sourceKey: 'formId' });

Participant.hasOne(EventRegistration, { as: 'form', sourceKey: 'formId', foreignKey: 'id' });
Participant.hasOne(Event, { as: 'event', sourceKey: 'eventId', foreignKey: 'id' });
Participant.hasMany(ParticipantSession, { as: 'pSessions', sourceKey: 'id', foreignKey: 'participantId' });
Participant.hasOne(CustomPaymentItem, { as: 'paymentTitle1Obj', foreignKey: 'itemId', sourceKey: 'paymentTitle1' });
Participant.hasOne(CustomPaymentItem, { as: 'paymentTitle2Obj', foreignKey: 'itemId', sourceKey: 'paymentTitle2' });
Participant.hasOne(CustomPaymentItem, { as: 'paymentTitle3Obj', foreignKey: 'itemId', sourceKey: 'paymentTitle3' });
Participant.hasOne(CustomPaymentItem, { as: 'paymentTitle4Obj', foreignKey: 'itemId', sourceKey: 'paymentTitle4' });
Participant.hasOne(CustomPaymentItem, { as: 'paymentTitle5Obj', foreignKey: 'itemId', sourceKey: 'paymentTitle5' });
Participant.hasOne(CustomPaymentItem, { as: 'paymentTitle6Obj', foreignKey: 'itemId', sourceKey: 'paymentTitle6' });
Participant.hasOne(CustomPaymentItem, { as: 'paymentTitle7Obj', foreignKey: 'itemId', sourceKey: 'paymentTitle7' });
Participant.hasOne(CustomPaymentItem, { as: 'paymentTitle8Obj', foreignKey: 'itemId', sourceKey: 'paymentTitle8' });
Participant.hasOne(CustomPaymentItem, { as: 'paymentTitle9Obj', foreignKey: 'itemId', sourceKey: 'paymentTitle9' });
Participant.hasOne(CustomPaymentItem, { as: 'paymentTitle10Obj', foreignKey: 'itemId', sourceKey: 'paymentTitle10' });

ParticipantSession.hasOne(Participant, { as: 'participant', foreignKey: 'id', sourceKey: 'participantId' });
ParticipantSession.hasOne(EventSession, { as: 'eventSession', foreignKey: 'id', sourceKey: 'sessionId' });

Attendance.hasOne(Participant, { as: 'participant', sourceKey: 'participantId', foreignKey: 'id' });
Attendance.hasOne(Event, { as: 'event', sourceKey: 'eventId', foreignKey: 'id' });
Attendance.hasOne(EventSession, { as: 'eventSession', sourceKey: 'sessionId', foreignKey: 'id' });

// Roster.hasOne(Department, { as: 'department', sourceKey: 'deptAbbr', foreignKey: 'deptAbbr' });
// Roster.hasOne(Event, { as: 'event', sourceKey: 'eventId', foreignKey: 'eventId' });

// Event.hasMany(Roster, { as: 'rosters', sourceKey: 'eventId', foreignKey: 'eventId' });

Web.hasOne(Event, { as: 'event', sourceKey: 'eventId', foreignKey: 'id' });
FileCollection.hasOne(Event, { as: 'event', sourceKey: 'eventId', foreignKey: 'id' });
FileSubmission.hasOne(FileCollection, { as: 'collection', sourceKey: 'collectionId', foreignKey: 'id' });

CustomPaymentEvent.hasMany(CustomPaymentItem, { as: 'items', foreignKey: 'eventId', sourceKey: 'eventId' });
import { sequelize } from "../utilities/database";
import { DataTypes, Model, Optional } from "sequelize";
import { CustomPaymentItem } from './customPaymentItem'
// import { UUID } from 'crypto';

interface CustomPaymentEventAttributes {
    eventId: string;
    eventTitle: string;
    eventCode: string;
    deptAbbr: string;
    department: string;
    contactPerson: string;
    contactEmail: string;
    contactTelephone: string;
    duplicatePaymentAllowed: boolean;
    eventStartDate: Date;
    eventEndDate: Date;
    activeEventStatus: boolean;
    payerNameRequired: boolean;
    payerEmailRequired: boolean;
}

// interface CustomPaymentEventCreationAttributes
//     extends Optional<CustomPaymentEventAttributes, "id" | "banner"> { }

class CustomPaymentEvent
    extends Model<
        CustomPaymentEventAttributes
    // ,CustomPaymentEventCreationAttributes
    >
    implements CustomPaymentEventAttributes {
    eventId: string;
    eventTitle: string;
    eventCode: string;
    deptAbbr: string;
    department: string;
    contactPerson: string;
    contactEmail: string;
    contactTelephone: string;
    duplicatePaymentAllowed: boolean;
    eventStartDate: Date;
    eventEndDate: Date;
    activeEventStatus: boolean;
    payerNameRequired: boolean;
    payerEmailRequired: boolean;

    public readonly items?: CustomPaymentItem[];

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

CustomPaymentEvent.init(
    {
        eventId: {
            type: DataTypes.STRING(255),
            primaryKey: true,
        },
        eventTitle: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        eventCode: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        deptAbbr: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        department: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        contactPerson: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        contactEmail: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        contactTelephone: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        duplicatePaymentAllowed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        eventStartDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        eventEndDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        activeEventStatus: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        payerNameRequired: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        payerEmailRequired: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "CustomPaymentEvent",
    }
);

export { CustomPaymentEvent, CustomPaymentEventAttributes };
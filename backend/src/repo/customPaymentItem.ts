import { sequelize } from "../utilities/database";
import { DataTypes, Model, Optional } from "sequelize";
// import { UUID } from 'crypto';

interface CustomPaymentItemAttributes {
    itemId: string;
    eventId: string;
    itemCode: string;
    itemName: string;
    multiSelect: boolean;
    itemNature: string;
    enableRemark: boolean;
    defaultAmount: number;
    defaultQuantity: number;
    editAmountEnabled: boolean;
    paymentItemStartDate: Date;
    paymentItemEndDate: Date;
}

// interface CustomPaymentItemCreationAttributes
//     extends Optional<CustomPaymentItemAttributes, "id" | "banner"> { }

class CustomPaymentItem
    extends Model<
        CustomPaymentItemAttributes
    // ,CustomPaymentItemCreationAttributes
    >
    implements CustomPaymentItemAttributes {
    itemId: string;
    eventId: string;
    itemCode: string;
    itemName: string;
    multiSelect: boolean;
    itemNature: string;
    enableRemark: boolean;
    defaultAmount: number;
    defaultQuantity: number;
    editAmountEnabled: boolean;
    paymentItemStartDate: Date;
    paymentItemEndDate: Date;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

CustomPaymentItem.init(
    {
        itemId: {
            type: DataTypes.STRING(255),
            primaryKey: true,
        },
        eventId: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        itemCode: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        itemName: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        multiSelect: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        itemNature: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        enableRemark: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        defaultAmount: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        defaultQuantity: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        editAmountEnabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        paymentItemStartDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        paymentItemEndDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "CustomPaymentItem",
    }
);

export { CustomPaymentItem, CustomPaymentItemAttributes };
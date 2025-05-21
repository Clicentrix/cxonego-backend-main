import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate } from "typeorm";
import { CustomBaseEntity } from "./CustomBaseEntity";
import { Contact } from "./Contact";
import { User } from "./User";
import { Organisation } from "./Organisation";
import { Account } from "./Account";
import { encryption } from "../common/utils";

// Define the document types enum
export enum DocumentType {
    NDA = 'NDA',
    MSA = 'MSA',
    SOW = 'SOW',
    SLA = 'SLA',
    AMC = 'AMC',
    MOU = 'MOU',
    OTHER = 'OTHER'
}

@Entity()
export class Document extends CustomBaseEntity {
    constructor(payload?: Document) {
        super();
        if (payload) {
            Object.assign(this, { ...payload });
        }
    }

    @PrimaryGeneratedColumn('uuid')
    documentId: string;

    @Column()
    fileName: string;

    @Column()
    fileType: string;

    @Column()
    googleDriveFileId: string;

    @Column()
    googleDriveLink: string;

    @Column({ nullable: true, type: "text" })
    description: string;

    @Column({ nullable: true })
    documentType: string;

    @Column({ nullable: true })
    customDocumentType: string;

    @Column({ nullable: true })
    startTime: Date;

    @Column({ nullable: true })
    endTime: Date;

    @Column({ nullable: true })
    deletedAt: Date;

    @ManyToOne(() => Contact, (contact) => contact.documents, {
        nullable: true,
        onUpdate: "CASCADE",
    })
    @JoinColumn({ name: "contactId" })
    contact: Contact;

    @ManyToOne(() => Account, (account) => account.documents, {
        nullable: true,
        onUpdate: "CASCADE",
    })
    @JoinColumn({ name: "accountId" })
    account: Account;

    @ManyToOne(() => User, (user) => user.documents, {
        onUpdate: "CASCADE",
        nullable: false,
        eager: true
    })
    @JoinColumn({ name: "uploadedById" })
    uploadedBy: User;

    @ManyToOne(() => Organisation, {
        nullable: true,
        onUpdate: "CASCADE",
    })
    @JoinColumn({ name: "organizationId" })
    organization: Organisation;

    @BeforeInsert()
    @BeforeUpdate()
    encrypt() {
        // if (this.fileName) this.fileName = encryption(this.fileName);
        // if (this.description) this.description = encryption(this.description);
        // if (this.documentType) this.documentType = encryption(this.documentType);
        // if (this.customDocumentType) this.customDocumentType = encryption(this.customDocumentType);
    }
} 
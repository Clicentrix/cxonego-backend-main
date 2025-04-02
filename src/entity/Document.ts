import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { CustomBaseEntity } from "./CustomBaseEntity";
import { Contact } from "./Contact";
import { User } from "./User";
import { Organisation } from "./Organisation";
import { encryption } from "../common/utils";

@Entity()
export class Document extends CustomBaseEntity {
    constructor(payload: Document) {
        super();
        Object.assign(this, { ...payload });
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

    @Column({ nullable: true })
    description: string;

    @ManyToOne(() => Contact, (contact) => contact.documents, {
        onUpdate: "CASCADE",
        nullable: false,
    })
    @JoinColumn({ name: "contactId" })
    contact: Contact;

    @ManyToOne(() => User, (user) => user.documents, {
        onUpdate: "CASCADE",
        nullable: false,
        eager: true
    })
    @JoinColumn({ name: "uploadedById" })
    uploadedBy: User;

    @ManyToOne(() => Organisation, {
        onUpdate: "CASCADE",
        nullable: true
    })
    @JoinColumn({ name: "organizationId" })
    organization: Organisation;

    encrypt() {
        if (this.fileName) this.fileName = encryption(this.fileName);
        if (this.description) this.description = encryption(this.description);
    }
} 
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    email: string

    @Column()
    role: string

    @Column()
    isOnboarded: boolean

    @Column()
    createdAt: string

    @Column({
        nullable: true,
    })
    deletedAt: string

    @Column()
    updateAt: string

}

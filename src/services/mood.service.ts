import { Contact } from "../entity/Contact";
import { AppDataSource } from "../data-source";
import { UpdateResult,EntityManager,Repository } from "typeorm";
import { Account } from "../entity/Account";
import { ResourceNotFoundError } from "../common/errors";
import { Readable } from "typeorm/platform/PlatformTools";
import { encryption, moodCategory, roleNames } from "../common/utils";
import { decrypt } from "../common/utils";
import { Lead } from "../entity/Lead";
import { accountDecryption, contactDecryption, leadDecryption, multipleleadsDecryption } from "./decryption.service";
import { ContactSchemaType } from "../schemas/contact.schema";
import { DateRangeParamsType } from "../schemas/comman.schemas";
import { Role } from "../entity/Role";
import { MoodImage } from "../entity/MoodImage";
import { MoodSchemaArrayType, MoodSchemaType } from "../schemas/mood.schemas";
import { User } from "../entity/User";

class MoodServices{
    
    async createMood(
        payload:MoodImage,
        userId:string,
        transactionEntityManager:EntityManager
        ){        
        const userRepo  = AppDataSource.getRepository(User);
        const userData = await userRepo.findOne({where : {userId:userId},});         
        if(userData){
            payload.owner = userData;
        }
        
        const moodRepository:Repository<MoodImage> = transactionEntityManager.getRepository(MoodImage);
        const image = await moodRepository.findOne({
            "where":{"imageUrl":payload.imageUrl}
        });
        if(image){
            throw new Error("Image already exists");
        }
        const moodObj =  await moodRepository.save(payload);   
                   
        return moodObj;
    }

    /*
    async createMoods(
        payloads: MoodImage[], 
        owner: string,
        transactionEntityManager: EntityManager
    ){        
        const moodRepository: Repository<MoodImage> = transactionEntityManager.getRepository(MoodImage);
        const savedMoods = []; 
        
        if(payloads.length>0){
        for (const payload of payloads) {
            payload.owner = owner;            
            const existingImage = await moodRepository.findOne({
                where: { "imageUrl": payload.imageUrl }
            });
            
            if (!existingImage) {
                const moodObj = await moodRepository.save(payload);                
                savedMoods.push(moodObj); 
            } else {                        
                console.log("Image already exists and was not saved: ", payload.imageUrl);
            }
        }    
         return savedMoods;
      }
    }
    */
    async getAllMoodImages(_moodCategory:moodCategory){
        try{
                                              
            const moodImages =  await AppDataSource.getRepository(MoodImage)
            .createQueryBuilder("MoodImage")            
            .select()
            // .select(["MoodImage.id","MoodImage.moodCategory","MoodImage.imageUrl"])
            .where(" MoodImage.moodCategory = :mood ", { mood: _moodCategory })
            .getMany();   

            /* const moodcategory  = moodCategory[_moodCategory] ;
               const moodImages =  await AppDataSource.getRepository(MoodImage)
               .find({
                  where:{"moodCategory":moodCategory}
                });*/
            
            if (moodImages && moodImages.length > 0) {
                return moodImages;
            }
            return []; 
        }catch(error){
            return ;
        }
    }

    async setMoodOfUser(userId:string,backgroundImageUrl:string,             transactionEntityManager:EntityManager) {
        try{
            const userRepository = transactionEntityManager.getRepository(User);
            const user = await userRepository.findOne({where:{"userId":userId}});
            if (user) {
                user.backgroundImageUrl = backgroundImageUrl as string;                 
                const update = await AppDataSource.getRepository(User).save(user);
                return update;
            } 
            else{
                throw new ResourceNotFoundError("User not found");
            }                              
          
         
        }catch(error){
            throw new Error("Something went wrong please try again later");
        }
    }
} 

export default MoodServices;




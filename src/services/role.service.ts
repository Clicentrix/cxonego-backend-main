
import { NextFunction, Request,Response } from "express";
import { CustomRequest } from "../interfaces/types";
import { User } from "../entity/User";
import { AppDataSource } from "../data-source";
import { Role } from "../entity/Role";


class RoleServices{
    async getRoles(){
        try{
            const role = await AppDataSource.getRepository(Role).find();
            return role;
        }catch(error){
            return ;
        }
        
    }
    async isRoleExistsByName(name:string){
        const role=await AppDataSource.getRepository(Role).findOne({
            "where":{
                "roleName":name
            }
        })
        
        return role?true:false;
    }
    async createRole(payload:Role){
        try{
            
            if(await this.isRoleExistsByName(payload.roleName)){
                throw new Error("role already exists");
            }

            const roleRepo = await AppDataSource.getRepository(Role);            
            return await roleRepo.save(payload);
            
        }catch(error){
            return;
        }
    }

    async updateRole(roleId:number,payload:Role){
        try{
            const roleRepository = await AppDataSource.getRepository(Role);
            const role = await roleRepository.findOne({
                where:{
                    "roleId":roleId
                }
            })
            if(!role){
                throw new Error("Role not found");
            }
            const updatedRole = await roleRepository.update(roleId,payload);
            return updatedRole;
        }catch(error){
            return;
        }
    }

    async deleteRole(roleId:number){
        try{
            const roleRepo=await AppDataSource.getRepository(Role);
            const role=await roleRepo.findOne({
                where:{
                    "roleId":roleId
                }
            })
            if(!role){
                throw new Error("Role not found");
            }
            await roleRepo.delete(roleId);
            return role;
        }catch(error){
            return;
        }
    }
}
export default RoleServices;
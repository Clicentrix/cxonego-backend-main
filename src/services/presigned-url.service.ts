import S3Handler from "./file-upload.service";

class PresignerSignedURL{
    
    async getSignedURL(key:string,contentType:string):Promise<string>{
        try{
        const s3Handler = new S3Handler();
        const url:string = await s3Handler.getPreSignedURL(key, contentType);
        return url;
        }catch(error){
            throw new Error(error);
        }
    }
}

export default PresignerSignedURL;
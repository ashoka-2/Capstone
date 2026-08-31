import { k8sCoreV1Api } from "./config.js";


export const createService = async (sandboxId)=>{

    const serviceManifest = {
        metadata:{
            name:`sandbox-service-${sandboxId}`,
            labels:{
                app:"sandbox",
                sandboxId:sandboxId
            }
        },
        spec:{
            selector:{
                app:"sandbox-instance",
                sandboxId:sandboxId
            },
            ports:[
                {
                    name:"http",
                    port:80,
                    targetPort:5173,
                    protocol:"TCP"
                },
                {
                    name:"agent-http",
                    port:3000,
                    targetPort:3000,
                    protocol:"TCP"
                }
            ],
            type:"ClusterIP",
        }
    }

    try {
        const response = await k8sCoreV1Api.createNamespacedService({
            namespace: "default",
            body: serviceManifest
        });
        return response;
    } catch (err) {
        if (
            err.response?.statusCode === 409 ||
            err.statusCode === 409 ||
            err.message?.includes("AlreadyExists") ||
            err.body?.reason === "AlreadyExists"
        ) {
            console.log(`Service sandbox-service-${sandboxId} already exists, reusing.`);
            return { body: { metadata: { name: `sandbox-service-${sandboxId}` } } };
        }
        throw err;
    }
}

export const deleteService = async (sandboxId) => {
    try {
        return await k8sCoreV1Api.deleteNamespacedService({
            name: `sandbox-service-${sandboxId}`,
            namespace: "default",
        });
    } catch (err) {
        console.warn(`Service deletion note for ${sandboxId}:`, err.message);
        return null;
    }
}


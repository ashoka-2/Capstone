import { k8sCoreV1Api } from "./config.js";

export async function createPod(sandboxId) {
  const podManifest = {
    metadata: {
      name: `sandbox-pod-${sandboxId}`,
      labels: {
        app: "sandbox-instance",
        sandboxId: sandboxId,
      },
    },
    spec: {
      volumes:[
        {
          name:"workspace-volume",
          emptyDir:{},

        }
      ],
      initContainers:[
        {
          name:"init-container",
          image:"template:latest",
          imagePullPolicy:"IfNotPresent",
          command:["sh", "-c", "cp -r /workspace/. /seed/"],
          volumeMounts:[
            {
              name:"workspace-volume",
              mountPath:"/seed",
            },
          ],
        }
      ],
      containers: [
        {
          name: "sandbox-container",
          image: "template:latest",
          imagePullPolicy: "IfNotPresent",
          ports: [
            {
              containerPort: 5173,
              name: "http",
            },
          ],
          resources: {
            limits: { cpu: "500m", memory: "1Gi" },
            requests: { cpu: "250m", memory: "500Mi" },
          },
          volumeMounts: [
            {
              name: "workspace-volume",
              mountPath: "/workspace",
            },
          ],
        },
        {
          name: "agent-container",
          image: "agent:latest",
          imagePullPolicy: "IfNotPresent",
          ports: [
            {
              containerPort: 3000,
              name: "http",
            },
          ],
          resources: {
            limits: { cpu: "500m", memory: "1Gi" },
            requests: { cpu: "250m", memory: "500Mi" },
          },
          volumeMounts: [
            {
              name: "workspace-volume",
              mountPath: "/workspace",
            },
          ],
        },
      ],
    },
  };

  try {
    const response = await k8sCoreV1Api.createNamespacedPod({
      namespace: "default",
      body: podManifest,
    });
    return response;
  } catch (err) {
    if (
      err.response?.statusCode === 409 ||
      err.statusCode === 409 ||
      err.message?.includes("AlreadyExists") ||
      err.body?.reason === "AlreadyExists"
    ) {
      console.log(`Pod sandbox-pod-${sandboxId} already exists, reusing.`);
      return { body: { metadata: { name: `sandbox-pod-${sandboxId}` } } };
    }
    throw err;
  }
}

export async function getPod(sandboxId) {
  try {
    const res = await k8sCoreV1Api.readNamespacedPod({
      name: `sandbox-pod-${sandboxId}`,
      namespace: "default",
    });
    return res;
  } catch (err) {
    return null;
  }
}

export async function deletePod(sandboxId) {
  try {
    return await k8sCoreV1Api.deleteNamespacedPod({
      name: `sandbox-pod-${sandboxId}`,
      namespace: "default",
    });
  } catch (err) {
    console.warn(`Pod deletion note for ${sandboxId}:`, err.message);
    return null;
  }
}

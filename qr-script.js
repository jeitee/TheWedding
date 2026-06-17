const input = document.getElementById("images");
const preview = document.getElementById("preview");
const uploadBtn = document.getElementById("uploadBtn");
const uploader = document.getElementById("uploader");
const previewAllBtn = document.getElementById("previewAllBtn");
const message = document.getElementById("message");

const uploadLabel = document.getElementById("uploadLabel");
const uploadHint = document.getElementById("uploadHint");
const toast = document.getElementById("toast");

const CLOUD_NAME = "ddokjiyuy";
const UPLOAD_PRESET = "wedding_uploads";


const SUPABASE_URL = "https://olgwdktmuvdzvwuudsku.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_OsSh_YU6BHaiQkOS2INKNg_nHfvl_4r";
const EVENT_ID = "teejei-judith";

const sb = window.supabase.createClient(
SUPABASE_URL,
SUPABASE_ANON_KEY
);

let allFiles = [];
let isExpanded = false;
let uploadType = "photo";

/* =========================
TOAST
========================= */

function showToast(text, type = "info") {


toast.textContent = text;

toast.className = "toast show";
toast.classList.add(type);

setTimeout(() => {
    toast.classList.remove("show");
}, 3000);


}

/* =========================
FILE TYPE SWITCH
========================= */

document
.querySelectorAll("[name='uploadType']")
.forEach(radio => {

    radio.addEventListener(
        "change",
        handleUploadType
    );
});

function handleUploadType(e) {

uploadType = e.target.value;

input.value = "";
preview.innerHTML = "";

allFiles = [];

if (uploadType === "photo") {

    input.accept = "image/*";

    uploadLabel.textContent =
        "📸 Tap to select photos";

    uploadHint.textContent =
        "Maximum 30 photos";

} else {

    input.accept = "video/*";

    uploadLabel.textContent =
        "🎥 Tap to select videos";

    uploadHint.textContent =
        "Maximum 3 videos";
}

}

/* =========================
FILE SELECT
========================= */

input.addEventListener("change", () => {


let selectedFiles = Array.from(input.files);

// =========================
// PHOTO MODE
// =========================

if (uploadType === "photo") {

    const validPhotos = selectedFiles.filter(
        file => file.type.startsWith("image/")
    );

    const removedCount =
        selectedFiles.length - validPhotos.length;

    if (removedCount > 0) {

        showToast(
            `${removedCount} non-photo file(s) removed`,
            "error"
        );
    }

    selectedFiles = validPhotos;

    if (selectedFiles.length > 30) {

        showToast(
            "Maximum 30 photos allowed",
            "error"
        );

        selectedFiles =
            selectedFiles.slice(0, 30);
    }
}

// =========================
// VIDEO MODE
// =========================

if (uploadType === "video") {

    const validVideos = selectedFiles.filter(
        file => file.type.startsWith("video/")
    );

    const removedCount =
        selectedFiles.length - validVideos.length;

    if (removedCount > 0) {

        showToast(
            `${removedCount} non-video file(s) removed`,
            "error"
        );
    }

    selectedFiles = validVideos;

    // Remove videos larger than 75MB

    const oversizedVideos =
        selectedFiles.filter(
            file =>
                file.size >
                75 * 1024 * 1024
        );

    if (oversizedVideos.length > 0) {

        showToast(
            `${oversizedVideos.length} video(s) exceeded 75MB and were removed`,
            "error"
        );

        selectedFiles =
            selectedFiles.filter(
                file =>
                    file.size <=
                    75 * 1024 * 1024
            );
    }

    if (selectedFiles.length > 3) {

        showToast(
            "Maximum 3 videos allowed",
            "error"
        );

        selectedFiles =
            selectedFiles.slice(0, 3);
    }
}

allFiles = selectedFiles;

preview.innerHTML = "";
isExpanded = false;

renderPreview();

if (allFiles.length > 10) {

    previewAllBtn.style.display =
        "inline-block";

    previewAllBtn.textContent =
        `Preview All (${allFiles.length})`;

} else {

    previewAllBtn.style.display =
        "none";
}

if (allFiles.length > 0) {

    showToast(
        `${allFiles.length} ${uploadType}(s) selected`,
        "success"
    );
}


});


/* =========================
PREVIEW
========================= */

function renderPreview() {

preview.innerHTML = "";

const filesToShow = isExpanded
    ? allFiles
    : allFiles.slice(0, 10);

filesToShow.forEach(file => {

    const url =
        URL.createObjectURL(file);

    if (
        file.type.startsWith("image/")
    ) {

        const img =
            document.createElement("img");

        img.src = url;

        preview.appendChild(img);

    } else {

        const video =
            document.createElement("video");

        video.src = url;
        video.controls = true;

        preview.appendChild(video);
    }
});

}

/* =========================
PREVIEW TOGGLE
========================= */

previewAllBtn.addEventListener(
"click",
() => {

    isExpanded = !isExpanded;

    renderPreview();

    previewAllBtn.textContent =
        isExpanded
            ? "Show Less"
            : `Preview All (${allFiles.length})`;
}

);

/* =========================
CLOUDINARY UPLOAD
========================= */

async function uploadToCloudinary(file, uploaderName) {

const formData = new FormData();

formData.append(
    "file",
    file
);

formData.append(
    "upload_preset",
    UPLOAD_PRESET
);

formData.append(
    "folder",
    `${EVENT_ID}/${uploaderName}`
);

const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    {
        method: "POST",
        body: formData
    }
);

const result =
    await response.json();

if (!response.ok) {

    throw new Error(
        result.error?.message ||
        "Cloudinary upload failed"
    );
}

return result;

}

/* =========================
MAIN UPLOAD
========================= */

uploadBtn.addEventListener(
"click",
uploadFiles
);

async function uploadFiles() {

const uploaderName =
    uploader.value.trim();

const guestMessage =
    message.value.trim();

if (!uploaderName) {

    showToast(
        "Please enter your name",
        "error"
    );

    return;
}

if (!allFiles.length) {

    showToast(
        "Please select files",
        "error"
    );

    return;
}

try {

    uploadBtn.disabled = true;
    uploadBtn.textContent =
        "Uploading...";

    const {
        data: uploadRow,
        error: uploadError
    } = await sb
        .from("uploads")
        .insert({
            uploader: uploaderName,
            message: guestMessage,
            upload_type: uploadType,
            file_count: allFiles.length,
            storage_account:
                "cloudinary",
            event_id: EVENT_ID
        })
        .select()
        .single();

    if (uploadError)
        throw uploadError;

    const uploadId =
        uploadRow.id;

    for (const file of allFiles) {

        const cloudinary =
            await uploadToCloudinary(
                file,
                uploaderName
            );

        const fileType =
            file.type.startsWith(
                "image/"
            )
                ? "photo"
                : "video";

        const {
            error: fileError
        } = await sb
            .from("files")
            .insert({
                upload_id:
                    uploadId,

                original_filename:
                    file.name,

                stored_filename:
                    cloudinary.public_id,

                file_type:
                    fileType,

                file_id:
                    cloudinary.public_id,

                file_url:
                    cloudinary.secure_url,

                storage_account:
                    "cloudinary",

                file_size_mb:
                    Number(
                        (
                            file.size /
                            1024 /
                            1024
                        ).toFixed(2)
                    ),

                mime_type:
                    file.type,

                upload_status:
                    "completed",

                event_id:
                    EVENT_ID
            });

        if (fileError)
            throw fileError;
    }

    showToast(
        "Upload successful 💚",
        "success"
    );

    resetForm();

} catch (err) {

    console.error(err);

    showToast(
        err.message,
        "error"
    );

} finally {

    uploadBtn.disabled = false;

    uploadBtn.textContent =
        "Upload Memories";
}


}

/* =========================
RESET
========================= */

function resetForm() {


input.value = "";
uploader.value = "";
message.value = "";

preview.innerHTML = "";

allFiles = [];

previewAllBtn.style.display =
    "none";


}




// const input = document.getElementById("images");
// const preview = document.getElementById("preview");
// const uploadBtn = document.getElementById("uploadBtn");
// const uploader = document.getElementById("uploader");
// const previewAllBtn = document.getElementById("previewAllBtn");

// const SUPABASE_URL = "https://olgwdktmuvdzvwuudsku.supabase.co";
// const SUPABASE_ANON_KEY = "sb_publishable_OsSh_YU6BHaiQkOS2INKNg_nHfvl_4r";
// const BUCKET_NAME = "wedding-photos";

// const sb = window.supabase.createClient(
//     SUPABASE_URL,
//     SUPABASE_ANON_KEY
// );

// const message = document.getElementById("message");

// const EVENT_ID = "teejei-judith";
// const BUCKET_NAME = "wedding-photos";

// /* =========================
//    TOAST SYSTEM
// ========================= */
// const toast = document.getElementById("toast");

// function showToast(message, type = "info") {

//     toast.textContent = message;

//     toast.className = "toast show";
//     toast.classList.add(type);

//     setTimeout(() => {
//         toast.classList.remove("show");
//     }, 2500);
// }

// /* =========================
//    STATE
// ========================= */
// let allFiles = [];
// let isExpanded = false;

// /* =========================
//    INPUT CHANGE
// ========================= */
// input.addEventListener("change", () => {

//     preview.innerHTML = "";
//     allFiles = Array.from(input.files);
//     isExpanded = false;

//     renderPreview();

//     if (allFiles.length > 10) {
//         previewAllBtn.style.display = "inline-block";
//         previewAllBtn.textContent = `Preview All (${allFiles.length})`;
//     } else {
//         previewAllBtn.style.display = "none";
//     }

//     showToast(`${allFiles.length} photo(s) selected`);
// });

// /* =========================
//    RENDER PREVIEW
// ========================= */
// function renderPreview() {

//     preview.innerHTML = "";

//     const filesToShow = isExpanded
//         ? allFiles
//         : allFiles.slice(0, 10);

//     filesToShow.forEach(file => {

//         const reader = new FileReader();

//         reader.onload = (e) => {
//             const img = document.createElement("img");
//             img.src = e.target.result;
//             preview.appendChild(img);
//         };

//         reader.readAsDataURL(file);
//     });
// }

// /* =========================
//    TOGGLE PREVIEW BUTTON
// ========================= */
// previewAllBtn.addEventListener("click", () => {

//     isExpanded = !isExpanded;
//     renderPreview();

//     if (isExpanded) {
//         previewAllBtn.textContent = "Show Less";
//     } else {
//         previewAllBtn.textContent = `Preview All (${allFiles.length})`;
//     }
// });

// /* =========================
//    UPLOAD FLOW
// ========================= */
// // const scriptURL = "https://script.google.com/macros/s/AKfycbwhvpQXMZn_4rAXxON983iPB6_yXdz6nj6nYpz1obB3o-e661ytQw48Y5RjGChqtblfWQ/exec";

// /* =========================
//    ATTACH REAL UPLOAD
// ========================= */
// uploadBtn.onclick = uploadFiles;

// /* =========================
//    UPLOAD CONTROLLER
// ========================= */
// async function uploadFiles() {

//     uploadBtn.disabled = true;
//     uploadBtn.textContent = "Uploading...";

//     const files = Array.from(input.files);

//     const uploaderName = uploader.value.trim();
//     const guestMessage = message.value.trim();

//     if (!uploaderName) {

//         uploader.focus();
//         uploader.style.borderColor = "#d66";

//         showToast("Please enter your name", "error");

//         uploadBtn.disabled = false;
//         uploadBtn.textContent = "Upload Memories";

//         return;
//     }

//     if (!files.length) {

//         showToast("Please select at least one photo", "error");

//         uploadBtn.disabled = false;
//         uploadBtn.textContent = "Upload Memories";

//         return;
//     }

//     uploader.style.borderColor = "";

//     showToast("Uploading memories...", "info");

//     try {

//         // Upload all files
//         await Promise.all(
//             files.map(file =>
//                 uploadSingle(file, uploaderName)
//             )
//         );

//         // Save guest message
//         await saveGuestMessage(
//             uploaderName,
//             guestMessage,
//             files.length
//         );

//         showToast(
//             "Upload successful 💚 Thank you for sharing!",
//             "success"
//         );

//         resetAfterUpload();

//     } catch (err) {

//         console.error("Upload Error:", err);

//         showToast(
//             err.message || "Upload failed ❌ Please try again",
//             "error"
//         );

//     } finally {

//         uploadBtn.disabled = false;
//         uploadBtn.textContent = "Upload Memories";
//     }
// }

// /* =========================
//    SINGLE FILE UPLOAD
// ========================= */
// async function uploadSingle(file, uploaderName) {

//     const safeUploader = uploaderName
//         .replace(/[^a-zA-Z0-9-_ ]/g, "")
//         .trim();

//     const uniqueName =
//         `${Date.now()}-${crypto.randomUUID()}-${file.name}`;

//     const filePath =
//         `${EVENT_ID}/${safeUploader}/${uniqueName}`;

//     const { error } = await sb.storage
//         .from(BUCKET_NAME)
//         .upload(filePath, file, {
//             cacheControl: "3600",
//             upsert: false
//         });

//     if (error) {
//         throw error;
//     }

//     return true;
// }

// /* =========================
//    SAVE GUEST MESSAGE
// ========================= */
// async function saveGuestMessage(
//     uploaderName,
//     guestMessage,
//     fileCount
// ) {

//     const { error } = await sb
//         .from("memories")
//         .insert({
//             uploader: uploaderName,
//             message: guestMessage,
//             photo_count: fileCount
//         });

//     if (error) {
//         throw error;
//     }

//     return true;
// }

// /* =========================
//    RESET AFTER UPLOAD
// ========================= */
// function resetAfterUpload() {

//     input.value = "";
//     preview.innerHTML = "";

//     uploader.value = "";
//     message.value = "";

//     previewAllBtn.style.display = "none";

//     allFiles = [];
//     isExpanded = false;
// }

// const uploadLabel =
//     document.getElementById("uploadLabel");

// const uploadHint =
//     document.getElementById("uploadHint");

// let uploadType = "photo";

// document
//     .querySelectorAll("[name='uploadType']")
//     .forEach(radio => {

//         radio.addEventListener(
//             "change",
//             handleUploadType
//         );
//     });

// function handleUploadType(e) {

//     uploadType = e.target.value;

//     if (uploadType === "photo") {

//         input.accept = "image/*";

//         uploadLabel.textContent =
//             "📸 Tap to select photos";

//         uploadHint.textContent =
//             "Maximum 30 photos";

//     } else {

//         input.accept = "video/*";

//         uploadLabel.textContent =
//             "🎥 Tap to select videos";

//         uploadHint.textContent =
//             "Maximum 3 videos";
//     }
// }
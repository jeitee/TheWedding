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


const SUPABASE_URL = "https://jwixdwokeguliuwbwbqs.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_LN5IZzt80pI20i8W4kT-4g_BkEEKlss";
const EVENT_ID = "teejei-judith";

const sb = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

let allFiles = [];
let isExpanded = false;
let uploadType = "photo";

/* =========================
WEDDING DATE / TIME GATE
========================= */

const WEDDING_DATE = "2026-12-20";

// Uploads only open at this hour (24h clock) on the wedding date itself
const UPLOAD_START_HOUR = 17; // 5:00 PM

const [WEDDING_YEAR, WEDDING_MONTH, WEDDING_DAY] =
    WEDDING_DATE.split("-").map(Number);

const uploadOpenTime = new Date(
    WEDDING_YEAR,
    WEDDING_MONTH - 1,
    WEDDING_DAY,
    UPLOAD_START_HOUR,
    0,
    0
);

const UPLOAD_EXTRA_DAYS = 2; // uploads stay open this many extra days after the wedding day

const uploadCloseTime = new Date(
    WEDDING_YEAR,
    WEDDING_MONTH - 1,
    WEDDING_DAY + UPLOAD_EXTRA_DAYS,
    23,
    59,
    59
);

const WEDDING_DATE_LABEL = uploadOpenTime.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
});

function checkUploadWindow() {

    const now = new Date();

    if (now > uploadCloseTime) {

        return {
            allowed: false,
            status: "closed",
            message: "Thank you for celebrating with us. This gallery is no longer accepting new memories."
        };
    }

    if (now < uploadOpenTime) {

        const isWeddingDay =
            now.getFullYear() === WEDDING_YEAR &&
            now.getMonth() === WEDDING_MONTH - 1 &&
            now.getDate() === WEDDING_DAY;

        return {
            allowed: false,
            status: "waiting",
            message: isWeddingDay
                ? "Sharing begins this evening at 5:00 PM. We can't wait to see the day through your eyes."
                : `Sharing will open on ${WEDDING_DATE_LABEL} at 5:00 PM. We can't wait to see the day through your eyes.`
        };
    }

    return { allowed: true, status: "open" };
}

const uploadStatus = document.getElementById("uploadStatus");
const uploadBox = document.querySelector(".upload-box");

function formatCountdown(msRemaining) {

    const totalSeconds = Math.max(
        0,
        Math.floor(msRemaining / 1000)
    );

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Once a full day or more remains, drop seconds so the
    // countdown reads calmly instead of ticking every second.
    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    }

    const parts = [];

    if (hours > 0) parts.push(`${hours}h`);
    if (hours > 0 || minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return parts.join(" ");
}

function applyUploadGateUI() {

    const gate = checkUploadWindow();

    input.disabled = !gate.allowed;
    uploadBtn.disabled = !gate.allowed;
    uploader.disabled = !gate.allowed;
    message.disabled = !gate.allowed;

    uploadBox.classList.toggle("disabled", !gate.allowed);

    if (gate.allowed) {

        uploadStatus.style.display = "none";
        uploadStatus.classList.remove("closed");
        return;
    }

    uploadStatus.style.display = "block";
    uploadStatus.classList.toggle("closed", gate.status === "closed");

    if (gate.status === "waiting") {

        const remaining = uploadOpenTime - new Date();
        uploadStatus.textContent =
            `${gate.message} (${formatCountdown(remaining)} remaining)`;

    } else {

        uploadStatus.textContent = gate.message;
    }
}

applyUploadGateUI();
setInterval(applyUploadGateUI, 1000);

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

    const gate = checkUploadWindow();

    if (!gate.allowed) {

        input.value = "";

        return;
    }

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

    const gate = checkUploadWindow();

    if (!gate.allowed) {

        return;
    }

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

        uploadBtn.disabled = !checkUploadWindow().allowed;

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
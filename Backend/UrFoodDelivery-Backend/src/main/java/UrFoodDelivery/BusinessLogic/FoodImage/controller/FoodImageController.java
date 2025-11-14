package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.FoodImage.controller;

import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.FoodImage.entity.FoodImage;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.FoodImage.service.FoodImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/food-images")
@RequiredArgsConstructor
public class FoodImageController {

    private final FoodImageService foodImageService;

    /**
     * Upload a food image
     * POST /api/food-images/upload?reference={uuid}
     */
    @PostMapping("/upload/{reference}")
    public ResponseEntity<FoodImage> uploadImage(
            @RequestParam("file") MultipartFile file,
            @PathVariable("reference") UUID reference) {
        try {
            FoodImage savedImage = foodImageService.uploadImage(file, reference);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedImage);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Download image by reference UUID
     * GET /api/food-images/download/reference/{reference}
     */
    @GetMapping("/download/reference/{reference}")
    public ResponseEntity<Resource> downloadImageByReference(@PathVariable UUID reference) {
        try {
            Resource resource = foodImageService.downloadImageByReference(reference);
            FoodImage metadata = foodImageService.getImageByReference(reference);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(getMediaType(metadata.getOriginalName())))
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "inline; filename=\"" + metadata.getOriginalName() + "\"")
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Download image by its own UUID
     * GET /api/food-images/download/{uid}
     */
    @GetMapping("/download/{uid}")
    public ResponseEntity<Resource> downloadImageByUid(@PathVariable UUID uid) {
        try {
            Resource resource = foodImageService.downloadImageByUid(uid);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment")
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Get image metadata by reference
     * GET /api/food-images/metadata/{reference}
     */
    @GetMapping("/metadata/{reference}")
    public ResponseEntity<FoodImage> getImageMetadata(@PathVariable UUID reference) {
        try {
            FoodImage foodImage = foodImageService.getImageByReference(reference);
            return ResponseEntity.ok(foodImage);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Delete image by reference
     * DELETE /api/food-images/reference/{reference}
     */
    @DeleteMapping("/reference/{reference}")
    public ResponseEntity<Void> deleteImageByReference(@PathVariable UUID reference) {
        try {
            foodImageService.deleteImageByReference(reference);
            return ResponseEntity.noContent().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // Helper method to determine media type
    private String getMediaType(String filename) {
        if (filename == null) {
            return MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }
        
        String lowerFilename = filename.toLowerCase();
        if (lowerFilename.endsWith(".jpg") || lowerFilename.endsWith(".jpeg")) {
            return MediaType.IMAGE_JPEG_VALUE;
        } else if (lowerFilename.endsWith(".png")) {
            return MediaType.IMAGE_PNG_VALUE;
        } else if (lowerFilename.endsWith(".gif")) {
            return MediaType.IMAGE_GIF_VALUE;
        } else if (lowerFilename.endsWith(".webp")) {
            return "image/webp";
        }
        return MediaType.APPLICATION_OCTET_STREAM_VALUE;
    }
}
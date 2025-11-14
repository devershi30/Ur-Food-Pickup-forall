package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.FoodImage.service;

import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.FoodImage.entity.FoodImage;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.FoodImage.repository.FoodImageRepository;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Menu.model.FoodItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FoodImageService {

    private final FoodImageRepository foodImageRepository;

    @Value("${filesFolder}")
    private String filesFolder;

    /**
     * Upload a food image
     * @param file the image file to upload
     * @param reference the reference UUID (e.g., food item ID)
     * @return the saved FoodImage entity
     * @throws IOException if file operations fail
     */
    public FoodImage uploadImage(MultipartFile file, UUID reference) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Create directory if it doesn't exist
        Path uploadPath = Paths.get(filesFolder);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        String savedFileName = UUID.randomUUID().toString() + fileExtension;
        
        Path filePath = uploadPath.resolve(savedFileName);

        // Save file to disk
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Create and save entity

        FoodImage foodImage;
        Optional<FoodImage> optionalFoodImage = foodImageRepository.findByReference(reference);
        if(optionalFoodImage.isPresent()) {
            foodImage = optionalFoodImage.get();
            foodImage.setSaveFile(savedFileName);
        }
        else {

            foodImage = FoodImage.builder()
                    .originalName(originalFilename)
                    .uploadedOn(ZonedDateTime.now())
                    .reference(reference)
                    .saveFile(savedFileName)
                    .build();
        }

        FoodImage saved = foodImageRepository.save(foodImage);
        log.info("Uploaded image: {} for reference: {}", savedFileName, reference);
        
        return saved;
    }

    /**
     * Download a food image by reference UUID
     * @param reference the reference UUID
     * @return Resource containing the file
     * @throws IOException if file not found or cannot be read
     */
    public Resource downloadImageByReference(UUID reference) throws IOException {
        FoodImage foodImage = foodImageRepository.findByReference(reference)
                .orElseThrow(() -> new IllegalArgumentException("No image found for reference: " + reference));

        return getFileResource(foodImage.getSaveFile());
    }

    /**
     * Download a food image by its own UUID
     * @param uid the FoodImage entity UUID
     * @return Resource containing the file
     * @throws IOException if file not found or cannot be read
     */
    public Resource downloadImageByUid(UUID uid) throws IOException {
        FoodImage foodImage = foodImageRepository.findById(uid)
                .orElseThrow(() -> new IllegalArgumentException("Image not found: " + uid));

        return getFileResource(foodImage.getSaveFile());
    }

    /**
     * Get FoodImage metadata by reference
     * @param reference the reference UUID
     * @return FoodImage entity
     */
    public FoodImage getImageByReference(UUID reference) {
        return foodImageRepository.findByReference(reference)
                .orElseThrow(() -> new IllegalArgumentException("No image found for reference: " + reference));
    }

    /**
     * Delete a food image by reference
     * @param reference the reference UUID
     * @throws IOException if file deletion fails
     */
    public void deleteImageByReference(UUID reference) throws IOException {
        FoodImage foodImage = foodImageRepository.findByReference(reference)
                .orElseThrow(() -> new IllegalArgumentException("No image found for reference: " + reference));

        deleteFile(foodImage.getSaveFile());
        foodImageRepository.delete(foodImage);
        log.info("Deleted image for reference: {}", reference);
    }

    // Helper methods

    private Resource getFileResource(String fileName) throws IOException {
        Path filePath = Paths.get(filesFolder).resolve(fileName).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            throw new IOException("File not found or not readable: " + fileName);
        }

        return resource;
    }

    private void deleteFile(String fileName) throws IOException {
        Path filePath = Paths.get(filesFolder).resolve(fileName).normalize();
        Files.deleteIfExists(filePath);
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int lastDot = filename.lastIndexOf('.');
        return (lastDot == -1) ? "" : filename.substring(lastDot);
    }
}
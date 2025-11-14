package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.FoodImage.repository;

import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.FoodImage.entity.FoodImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FoodImageRepository extends JpaRepository<FoodImage, UUID> {

    Optional<FoodImage> findByReference(UUID reference);

}
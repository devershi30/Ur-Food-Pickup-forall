package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Menu.repository;

import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Menu.entity.MenuFood;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;


@Repository
public interface MenuFoodRepository extends JpaRepository<MenuFood, UUID> {
}

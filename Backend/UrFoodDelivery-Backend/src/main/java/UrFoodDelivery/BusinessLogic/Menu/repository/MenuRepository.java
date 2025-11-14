package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Menu.repository;

import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Menu.entity.Menu;
import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.entities.Vendor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MenuRepository extends JpaRepository<Menu, UUID> {
    List<Menu> findByTitleIgnoreCase(@NotNull @NotEmpty @NotBlank String title);

    List<Menu> findByVendorAndTitleIgnoreCase(Vendor vendor, @NotNull @NotEmpty @NotBlank String title);

    List<Menu> findByVendorOrderByCreatedOnDesc(Vendor vendor);

    Optional<Menu> findByUidAndVendor(UUID menuId, Vendor vendor);

}

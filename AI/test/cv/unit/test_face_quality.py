"""
Unit tests for FaceQualityChecker
Tests image quality assessment functions
"""

import pytest
import numpy as np
from src.application.services.cv.face_recognition import FaceQualityChecker


class TestFaceQualityChecker:
    """Test suite for FaceQualityChecker class"""

    def test_check_sharpness_sharp_image(self, quality_checker, sample_face_image):
        """Test sharpness check on a reasonably sharp image"""
        sharpness = quality_checker.check_sharpness(sample_face_image)

        assert isinstance(sharpness, float)
        assert 0.0 <= sharpness <= 1.0
        # Sample image should have decent sharpness (>0.3)
        assert sharpness > 0.3

    def test_check_sharpness_blurry_image(self, quality_checker, blurry_face_image):
        """Test sharpness check on a blurry image"""
        sharpness = quality_checker.check_sharpness(blurry_face_image)

        assert isinstance(sharpness, float)
        assert 0.0 <= sharpness <= 1.0
        # Blurry image should have low sharpness
        assert sharpness < 0.5

    def test_check_sharpness_grayscale(self, quality_checker):
        """Test sharpness check works with grayscale images"""
        # Create grayscale image
        gray_image = np.random.randint(0, 255, (640, 640), dtype=np.uint8)

        sharpness = quality_checker.check_sharpness(gray_image)

        assert isinstance(sharpness, float)
        assert 0.0 <= sharpness <= 1.0

    def test_check_brightness_normal(self, quality_checker, sample_face_image):
        """Test brightness check on normal lit image"""
        brightness = quality_checker.check_brightness(sample_face_image)

        assert isinstance(brightness, float)
        assert 0.0 <= brightness <= 1.0
        # Sample image should have reasonable brightness (lowered threshold for random test images)
        assert brightness > 0.2

    def test_check_brightness_dark_image(self, quality_checker, dark_face_image):
        """Test brightness check on dark image"""
        brightness = quality_checker.check_brightness(dark_face_image)

        assert isinstance(brightness, float)
        assert 0.0 <= brightness <= 1.0
        # Dark image should have low brightness score
        assert brightness < 0.5

    def test_check_brightness_bright_image(self, quality_checker, bright_face_image):
        """Test brightness check on overly bright image"""
        brightness = quality_checker.check_brightness(bright_face_image)

        assert isinstance(brightness, float)
        assert 0.0 <= brightness <= 1.0
        # Overly bright image should also be penalized
        assert brightness < 0.8

    def test_check_brightness_grayscale(self, quality_checker):
        """Test brightness check works with grayscale images"""
        # Create grayscale image with medium brightness
        gray_image = np.ones((640, 640), dtype=np.uint8) * 128

        brightness = quality_checker.check_brightness(gray_image)

        assert isinstance(brightness, float)
        assert 0.0 <= brightness <= 1.0

    def test_calculate_overall_quality_good(self, quality_checker):
        """Test overall quality calculation with good scores"""
        overall = quality_checker.calculate_overall_quality(
            sharpness=0.9, brightness=0.8, face_score=0.95
        )

        assert isinstance(overall, float)
        assert 0.0 <= overall <= 1.0
        # Good scores should give high overall quality
        assert overall > 0.8

    def test_calculate_overall_quality_poor(self, quality_checker):
        """Test overall quality calculation with poor scores"""
        overall = quality_checker.calculate_overall_quality(
            sharpness=0.2, brightness=0.3, face_score=0.5
        )

        assert isinstance(overall, float)
        assert 0.0 <= overall <= 1.0
        # Poor scores should give low overall quality
        assert overall < 0.5

    def test_calculate_overall_quality_mixed(self, quality_checker):
        """Test overall quality with mixed scores"""
        overall = quality_checker.calculate_overall_quality(
            sharpness=0.8, brightness=0.4, face_score=0.7
        )

        assert isinstance(overall, float)
        assert 0.0 <= overall <= 1.0
        # Mixed scores should give medium quality
        assert 0.4 < overall < 0.8

    def test_calculate_overall_quality_weights(self, quality_checker):
        """Test that quality calculation uses correct weights"""
        # Sharpness weight = 0.4 (highest)
        overall_high_sharpness = quality_checker.calculate_overall_quality(
            sharpness=1.0, brightness=0.0, face_score=0.0
        )

        # Brightness weight = 0.3
        overall_high_brightness = quality_checker.calculate_overall_quality(
            sharpness=0.0, brightness=1.0, face_score=0.0
        )

        # Face score weight = 0.3
        overall_high_face = quality_checker.calculate_overall_quality(
            sharpness=0.0, brightness=0.0, face_score=1.0
        )

        # Sharpness should contribute most
        assert overall_high_sharpness > overall_high_brightness
        assert overall_high_sharpness > overall_high_face

        # Brightness and face_score should contribute equally
        assert abs(overall_high_brightness - overall_high_face) < 0.01

    def test_check_sharpness_edge_cases(self, quality_checker):
        """Test sharpness with edge cases"""
        # All black image (no edges)
        black_image = np.zeros((640, 640, 3), dtype=np.uint8)
        sharpness_black = quality_checker.check_sharpness(black_image)
        assert sharpness_black == 0.0

        # All white image (no edges)
        white_image = np.ones((640, 640, 3), dtype=np.uint8) * 255
        sharpness_white = quality_checker.check_sharpness(white_image)
        assert sharpness_white == 0.0

    def test_check_brightness_edge_cases(self, quality_checker):
        """Test brightness with edge cases"""
        # All black image
        black_image = np.zeros((640, 640, 3), dtype=np.uint8)
        brightness_black = quality_checker.check_brightness(black_image)
        assert brightness_black == 0.0

        # Optimal brightness (mean = 128 ≈ 0.5)
        optimal_image = np.ones((640, 640, 3), dtype=np.uint8) * 128
        brightness_optimal = quality_checker.check_brightness(optimal_image)
        # Should be close to 1.0 (optimal)
        assert brightness_optimal > 0.9

    def test_overall_quality_boundary_values(self, quality_checker):
        """Test overall quality with boundary values"""
        # Minimum values
        overall_min = quality_checker.calculate_overall_quality(
            sharpness=0.0, brightness=0.0, face_score=0.0
        )
        assert overall_min == 0.0

        # Maximum values
        overall_max = quality_checker.calculate_overall_quality(
            sharpness=1.0, brightness=1.0, face_score=1.0
        )
        assert overall_max == 1.0


class TestFaceQualityIntegration:
    """Integration tests for quality checks on real-like images"""

    def test_quality_pipeline_good_image(self, quality_checker, sample_face_image):
        """Test full quality pipeline on good image"""
        sharpness = quality_checker.check_sharpness(sample_face_image)
        brightness = quality_checker.check_brightness(sample_face_image)
        overall = quality_checker.calculate_overall_quality(
            sharpness=sharpness,
            brightness=brightness,
            face_score=0.95,  # Assume good face detection
        )

        # All metrics should be reasonable (lowered thresholds for random test images)
        assert sharpness > 0.3
        assert brightness > 0.2
        assert overall > 0.3

    def test_quality_pipeline_poor_image(self, quality_checker, blurry_face_image):
        """Test full quality pipeline on poor quality image"""
        sharpness = quality_checker.check_sharpness(blurry_face_image)
        brightness = quality_checker.check_brightness(blurry_face_image)
        overall = quality_checker.calculate_overall_quality(
            sharpness=sharpness,
            brightness=brightness,
            face_score=0.6,  # Assume mediocre face detection
        )

        # Overall quality should be low
        assert overall < 0.6

    def test_quality_comparison(
        self, quality_checker, sample_face_image, blurry_face_image
    ):
        """Test that quality checker can distinguish between good and poor images"""
        # Good image
        sharp_sharpness = quality_checker.check_sharpness(sample_face_image)

        # Blurry image
        blurry_sharpness = quality_checker.check_sharpness(blurry_face_image)

        # Good image should have higher sharpness
        assert sharp_sharpness > blurry_sharpness

    def test_brightness_comparison(
        self, quality_checker, sample_face_image, dark_face_image
    ):
        """Test that brightness checker can distinguish lighting conditions"""
        # Normal image
        normal_brightness = quality_checker.check_brightness(sample_face_image)

        # Dark image
        dark_brightness = quality_checker.check_brightness(dark_face_image)

        # Normal image should have better brightness score
        assert normal_brightness > dark_brightness

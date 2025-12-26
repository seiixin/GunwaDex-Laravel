<?php
// Add these to routes/web.php (inside your auth+admin middleware group)

use App\Http\Controllers\Admin\StoriesManagementController;

Route::prefix('admin')->name('admin.')->middleware(['auth','verified'])->group(function () {
    Route::get('/stories', [StoriesManagementController::class, 'index'])->name('stories.index');
    Route::post('/stories', [StoriesManagementController::class, 'store'])->name('stories.store');
    Route::put('/stories/{story}', [StoriesManagementController::class, 'update'])->name('stories.update');
    Route::delete('/stories/{story}', [StoriesManagementController::class, 'destroy'])->name('stories.destroy');

    Route::post('/stories/{story}/toggle-featured', [StoriesManagementController::class, 'toggleFeatured'])->name('stories.toggleFeatured');
    Route::post('/stories/{story}/publish', [StoriesManagementController::class, 'publish'])->name('stories.publish');
    Route::post('/stories/{story}/draft', [StoriesManagementController::class, 'draft'])->name('stories.draft');
});

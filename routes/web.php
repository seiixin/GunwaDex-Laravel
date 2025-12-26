<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;

use Illuminate\Foundation\Auth\EmailVerificationRequest;

use App\Http\Controllers\Guest\HomeController;
use App\Http\Controllers\Guest\StoryController;
use App\Http\Controllers\Guest\EpisodeController;
use App\Http\Controllers\Guest\CategoryController;
use App\Http\Controllers\Guest\AuthorController;
use App\Http\Controllers\Guest\ArticleController;
use App\Http\Controllers\Guest\CommunityController;

use App\Http\Controllers\Engagement\CommentController;
use App\Http\Controllers\Engagement\ReactionController;
use App\Http\Controllers\Engagement\FavoriteController;
use App\Http\Controllers\Engagement\RatingController;
use App\Http\Controllers\Engagement\ViewController;

use App\Http\Controllers\Profile\ReaderProfileController;

use App\Http\Controllers\Admin\ContactSettingController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminPagesController;
use App\Http\Controllers\Admin\BackupRestoreController;
use App\Http\Controllers\Admin\BackupController;
use App\Http\Controllers\Admin\ChatController;
use App\Http\Controllers\Admin\PaymongoSettingsController;
use App\Http\Controllers\Admin\HeroSliderController;
use App\Http\Controllers\Admin\StoriesManagementController;


use App\Http\Controllers\ChatSupportController;
use App\Http\Controllers\UserContactUsController;

/*
|--------------------------------------------------------------------------
| Home
|--------------------------------------------------------------------------
*/
Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/preorder', fn () => Inertia::render('Guest/PreOrderForm'))->name('preorder');

/*
|--------------------------------------------------------------------------
| ✅ Email Verification (Breeze + Inertia)
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::get('/email/verify', function () {
        return Inertia::render('Auth/VerifyEmail');
    })->name('verification.notice');

    Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
        $request->fulfill();
        return redirect()->intended(route('home'));
    })->middleware(['signed', 'throttle:6,1'])->name('verification.verify');

    Route::post('/email/verification-notification', function (Request $request) {
        $request->user()->sendEmailVerificationNotification();
        return back()->with('status', 'verification-link-sent');
    })->middleware(['throttle:6,1'])->name('verification.send');
});

/*
|--------------------------------------------------------------------------
| Contact (Guest)
|--------------------------------------------------------------------------
*/
Route::get('/contact-us', [UserContactUsController::class, 'page'])->name('contact.us');

Route::post('/contact/send', [UserContactUsController::class, 'send'])
    ->name('contact.send')
    ->middleware('throttle:10,1');

Route::get('/contact/settings', [UserContactUsController::class, 'show'])->name('contact.settings');

/*
|--------------------------------------------------------------------------
| Guest browsing
|--------------------------------------------------------------------------
*/
Route::prefix('stories')->group(function () {
    Route::get('/{slug}', [StoryController::class, 'show'])->name('stories.show');
});

Route::prefix('episodes')->group(function () {
    Route::get('/{episodeId}/read', [EpisodeController::class, 'read'])->name('episodes.read');
});

Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');

Route::prefix('authors')->group(function () {
    Route::get('/', [AuthorController::class, 'index'])->name('authors.index');
    Route::get('/{username}', [AuthorController::class, 'show'])->name('authors.show');
});

Route::prefix('articles')->group(function () {
    Route::get('/', [ArticleController::class, 'index'])->name('articles.index');
    Route::get('/{slug}', [ArticleController::class, 'show'])->name('articles.show');
});

Route::prefix('community')->group(function () {
    Route::get('/', [CommunityController::class, 'index'])->name('community.index');
});

Route::get('/readers/{username}', [ReaderProfileController::class, 'showPublic'])->name('readers.show');

/*
|--------------------------------------------------------------------------
| Engagement (requires auth)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {
    Route::post('/comments', [CommentController::class, 'store'])->name('comments.store');
    Route::post('/reactions/like', [ReactionController::class, 'toggleLike'])->name('reactions.like.toggle');
    Route::post('/favorites/toggle', [FavoriteController::class, 'toggle'])->name('favorites.toggle');
    Route::post('/ratings', [RatingController::class, 'upsert'])->name('ratings.upsert');

    Route::get('/profile/reader', [ReaderProfileController::class, 'edit'])->name('profile.reader.edit');
    Route::patch('/profile/reader', [ReaderProfileController::class, 'update'])->name('profile.reader.update');
});

/*
|--------------------------------------------------------------------------
| ✅ Chat Support (User)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('chat')->name('chat.')->group(function () {
        Route::get   ('/conversations',                         [ChatSupportController::class, 'index'])->name('conversations.index');
        Route::post  ('/conversations',                         [ChatSupportController::class, 'store'])->name('conversations.store');
        Route::get   ('/conversations/{conversation}',          [ChatSupportController::class, 'show'])->name('conversations.show');
        Route::post  ('/conversations/{conversation}/messages', [ChatSupportController::class, 'sendMessage'])->name('messages.store');
        Route::put   ('/conversations/{conversation}/status',   [ChatSupportController::class, 'updateStatus'])->name('conversations.status');
        Route::delete('/messages/{message}',                    [ChatSupportController::class, 'destroyMessage'])->name('messages.destroy');
    });
});

/*
|--------------------------------------------------------------------------
| Views tracking (allow guests too, but throttle)
|--------------------------------------------------------------------------
*/
Route::middleware(['throttle:60,1'])
    ->post('/views/track', [ViewController::class, 'track'])
    ->name('views.track');

/*
|--------------------------------------------------------------------------
| ✅ Admin Panel (fixes /admin 404)
|--------------------------------------------------------------------------
| - Adds GET /admin (admin.dashboard)
| - Keeps your existing contact-setting endpoints
|--------------------------------------------------------------------------
*/Route::middleware(['auth', 'verified', 'is_admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        // Dashboard
        Route::get('/', [AdminPagesController::class, 'dashboard'])->name('dashboard');

        // UI pages (from your ZIP)
        Route::get('/hero', [AdminPagesController::class, 'hero'])->name('hero');
        Route::get('/stories', [AdminPagesController::class, 'stories'])->name('stories');
        Route::get('/users', [AdminPagesController::class, 'users'])->name('users');
        Route::get('/logs', [AdminPagesController::class, 'logs'])->name('logs');

        // Existing modules (you said these already exist — ZIP pages are placeholders)
        Route::get('/chat', [AdminPagesController::class, 'chat'])->name('chat');                 // placeholder
        Route::get('/backup', [AdminPagesController::class, 'backup'])->name('backup');           // placeholder
        Route::get('/paymongo', [AdminPagesController::class, 'paymongo'])->name('paymongo');     // placeholder

        // Extra admin modules from your screenshots/ZIP
        Route::get('/episodes', [AdminPagesController::class, 'episodes'])->name('episodes');
        Route::get('/categories-tags', [AdminPagesController::class, 'categoriesTags'])->name('categories_tags');
        Route::get('/comments-moderation', [AdminPagesController::class, 'commentsModeration'])->name('comments_moderation');
        Route::get('/community-moderation', [AdminPagesController::class, 'communityModeration'])->name('community_moderation');
        Route::get('/articles-management', [AdminPagesController::class, 'articlesManagement'])->name('articles_management');

        // Existing Contact Setting API/pages (keep your real controller)
        Route::get('/contact-setting', [ContactSettingController::class, 'show'])->name('contact-setting.show');
        Route::put('/contact-setting', [ContactSettingController::class, 'update'])->name('contact-setting.update');

        // OPTIONAL: if you want a separate page route name for sidebar "Contact Settings"
        Route::get('/contact-settings', [AdminPagesController::class, 'contactSettings'])->name('contact_settings');
   
        /*
        |--------------------------------------------------------------------------
        | Chat API
        |--------------------------------------------------------------------------
        */
        Route::get('/chat/service-status', [ChatController::class, 'getServiceStatus'])->name('chat.service-status');
        Route::get('/chat/conversations', [ChatController::class, 'getConversations'])->name('chat.conversations.index');
        Route::get('/chat/conversations/{conversation}', [ChatController::class, 'getMessages'])->name('chat.conversations.show');
        Route::get('/chat/search', [ChatController::class, 'searchConversations'])->name('chat.conversations.search');
        Route::get('/chat/stats', [ChatController::class, 'getStats'])->name('chat.stats');
        Route::post('/chat/conversations/{conversation}/messages', [ChatController::class, 'sendMessage'])->name('chat.conversations.messages.store');
        Route::put('/chat/conversations/{conversation}/status', [ChatController::class, 'updateConversationStatus'])->name('chat.conversations.status.update');
        Route::put('/chat/conversations/{conversation}/priority', [ChatController::class, 'updateConversationPriority'])->name('chat.conversations.priority.update');
        Route::post('/chat/conversations/{conversation}/archive', [ChatController::class, 'archiveConversation'])->name('chat.conversations.archive');
        Route::post('/chat/conversations/{conversation}/unarchive', [ChatController::class, 'unarchiveConversation'])->name('chat.conversations.unarchive');
        Route::post('/chat/archive-old', [ChatController::class, 'archiveOldConversations'])->name('chat.archive-old');

        /*
        |--------------------------------------------------------------------------
        | Backup
        |--------------------------------------------------------------------------
        */
        Route::get('/backup', [BackupController::class, 'index'])->name('backup');
        Route::post('/backups', [BackupController::class, 'store'])->name('backups.store');

        Route::get('/backups/download/{file}', [BackupController::class, 'download'])
            ->where('file', '^[A-Za-z0-9._-]+\.sql$')
            ->name('backups.download');

        Route::delete('/backups/files/{file}', [BackupController::class, 'destroyFile'])
            ->where('file', '^[A-Za-z0-9._-]+\.sql$')
            ->name('backups.files.destroy');

        Route::delete('/backups/files/bulk', [BackupController::class, 'destroyFilesBulk'])
            ->name('backups.files.bulk-destroy');

        Route::delete('/backups/{backup}', [BackupController::class, 'destroy'])
            ->name('backups.schedules.destroy');

        Route::delete('/backups/schedules/bulk', [BackupController::class, 'destroySchedulesBulk'])
            ->name('backups.schedules.bulk-destroy');

        Route::post('/backups/files/{file}/restore', [BackupRestoreController::class, 'restore'])
        ->name('admin.backups.files.restore');
        /*
        |--------------------------------------------------------------------------
        | Storage Manager
        |--------------------------------------------------------------------------
        */
        Route::get('/storage/files', [StorageManagerController::class, 'files'])->name('storage.files.index');
        Route::delete('/storage/files', [StorageManagerController::class, 'destroyFile'])->name('storage.files.destroy');
        Route::delete('/storage/files/bulk', [StorageManagerController::class, 'destroyFilesBulk'])->name('storage.files.bulk-destroy');

        // Paymongo Settings

        Route::get('/store-points/keys', [PaymongoSettingsController::class, 'getKeys'])
        ->name('paymongo.keys.get');

        Route::post('/store-points/keys', [PaymongoSettingsController::class, 'saveKeys'])
        ->name('paymongo.keys.save');

        // Hero Slider pages
        // ALIAS ROUTES (para tugma sa existing frontend: admin.hero.*)
        Route::post('/hero-slider', [HeroSliderController::class, 'store'])->name('hero.store');
        Route::put('/hero-slider/{slide}', [HeroSliderController::class, 'update'])->name('hero.update');
        Route::delete('/hero-slider/{slide}', [HeroSliderController::class, 'destroy'])->name('hero.destroy');
        Route::patch('/hero-slider/{slide}/toggle', [HeroSliderController::class, 'toggle'])->name('hero.toggle');
        Route::patch('/hero-slider/{slide}/position', [HeroSliderController::class, 'updatePosition'])->name('hero.position');
        Route::get('/hero-slider', [HeroSliderController::class, 'index'])->name('hero.index');
        Route::get('/hero-slider/{slide}/edit', [HeroSliderController::class, 'edit'])->name('hero.edit');

        // Stories Management
        Route::get('/stories', [StoriesManagementController::class, 'index'])->name('stories.index');
        Route::post('/stories', [StoriesManagementController::class, 'store'])->name('stories.store');
        Route::put('/stories/{story}', [StoriesManagementController::class, 'update'])->name('stories.update');
        Route::delete('/stories/{story}', [StoriesManagementController::class, 'destroy'])->name('stories.destroy');

        Route::post('/stories/{story}/toggle-featured', [StoriesManagementController::class, 'toggleFeatured'])->name('stories.toggleFeatured');
        Route::post('/stories/{story}/publish', [StoriesManagementController::class, 'publish'])->name('stories.publish');
        Route::post('/stories/{story}/draft', [StoriesManagementController::class, 'draft'])->name('stories.draft');

    });

/*
|--------------------------------------------------------------------------
| Auth routes (Breeze)
|--------------------------------------------------------------------------
*/
require __DIR__ . '/auth.php';

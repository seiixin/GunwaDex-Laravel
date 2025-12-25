<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;

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

// ✅ Added (reuse from your existing system)
use App\Http\Controllers\Admin\ContactSettingController;
use App\Http\Controllers\ChatSupportController;
use App\Http\Controllers\UserContactUsController;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/preorder', fn () => Inertia::render('Guest/PreOrderForm'))->name('preorder');

/*
|--------------------------------------------------------------------------
| Contact (Guest) - reused endpoints
|--------------------------------------------------------------------------
| You can keep your existing UI pages; these are the endpoints needed
| for contact settings and sending contact messages.
*/
Route::get('/contact-us', [UserContactUsController::class, 'page'])->name('contact.us');

Route::post('/contact/send', [UserContactUsController::class, 'send'])
    ->name('contact.send')
    ->middleware('throttle:10,1');

// Optional JSON endpoint (for pulling contact settings on guest pages)
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

// Public reader profile page (for ReaderDetail mock)
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

    /*
    |--------------------------------------------------------------------------
    | ✅ Chat Support (User) - reused routes
    |--------------------------------------------------------------------------
    | If you use email verification, add 'verified' middleware here.
    | Example: Route::middleware(['auth', 'verified'])->group(...)
    */
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
| ✅ Admin: Contact Setting API (from existing system)
|--------------------------------------------------------------------------
| If your admin middleware is different, replace 'is_admin' accordingly.
| If you don't have is_admin middleware yet, you can temporarily change
| this to just ['auth'] while you wire it up.
*/
Route::middleware(['auth', 'is_admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        Route::get('/contact-setting', [ContactSettingController::class, 'show'])->name('contact-setting.show');
        Route::put('/contact-setting', [ContactSettingController::class, 'update'])->name('contact-setting.update');
    });

require __DIR__ . '/auth.php';
